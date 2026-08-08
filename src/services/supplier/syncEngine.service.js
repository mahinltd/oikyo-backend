/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const crypto = require('crypto');
const axios = require('axios'); // For API calls
const supplierDal = require('../../dal/supplier/supplier.dal');
const ImportSessionLog = require('../../models/supplier/importSessionLog.model');
const universalAdapter = require('./universalSupplier.adapter');
const validationEngine = require('./importValidation.engine');
const changeDetection = require('./changeDetection.engine');
const syncEvents = require('../../events/sync.events');
const redisClient = require('../../config/redis.config');

class SyncEngineService {

    // =========================================================
    // 1. Global Orchestrator (Triggered by Cron Job)
    // =========================================================
    async triggerGlobalSync() {
        const activeSuppliers = await supplierDal.getActiveSuppliers();
        
        // Priority Sorting (if priority field exists, otherwise default sorting)
        activeSuppliers.sort((a, b) => (a.priority || 99) - (b.priority || 99));

        // Fire-and-forget or await based on need. We use Promise.allSettled to ensure 
        // one supplier failing doesn't stop others, allowing parallel execution structurally.
        const syncPromises = activeSuppliers.map(supplier => this.syncSupplier(supplier));
        await Promise.allSettled(syncPromises);
    }

    // =========================================================
    // 2. Single Supplier Orchestration (Concurrency & Resume)
    // =========================================================
    async syncSupplier(supplierConfig) {
        const lockKey = `sync:lock:${supplierConfig._id}`;
        
        // Concurrency Control via Redis (Prevents duplicate syncs for the same supplier)
        if (redisClient) {
            const isLocked = await redisClient.set(lockKey, 'locked', { nx: true, ex: 3600 }); // 1 hour lock
            if (!isLocked) {
                console.warn(`[SyncEngine] Sync already running for supplier: ${supplierConfig.supplierName}`);
                return;
            }
        }

        let session = await this._initializeOrResumeSession(supplierConfig);
        syncEvents.emit(syncEvents.EVENTS.SYNC_STARTED, { sessionId: session.sessionId, supplier: supplierConfig.supplierName });

        try {
            await this._executePaginationLoop(supplierConfig, session);
            
            // Mark Completed
            session.status = 'completed';
            session.endTime = Date.now();
            session.durationMs = session.endTime - session.startTime;
            await session.save();

            syncEvents.emit(syncEvents.EVENTS.SYNC_COMPLETED, { sessionId: session.sessionId, metrics: session.metrics });

        } catch (error) {
            session.status = 'failed';
            session.endTime = Date.now();
            await session.save();
            syncEvents.emit(syncEvents.EVENTS.SYNC_FAILED, { sessionId: session.sessionId, error: error.message });
        } finally {
            if (redisClient) await redisClient.del(lockKey); // Release Lock
        }
    }

    // =========================================================
    // 3. Pagination & Fetching Loop
    // =========================================================
    async _executePaginationLoop(config, session) {
        let currentPage = session.checkpoint.lastProcessedPage + 1;
        let lastPage = session.checkpoint.totalPagesFound || currentPage;
        let hasMore = true;

        const headers = config.apiConfig.headers ? Object.fromEntries(config.apiConfig.headers) : {};

        while (hasMore && currentPage <= lastPage) {
            try {
                // Fetch Data (Agnostic of Provider logic, purely using Config)
                const targetUrl = `${config.apiConfig.baseUrl}?${config.apiConfig.pagination.pageParamName}=${currentPage}`;
                const response = await axios.get(targetUrl, { headers });
                
                const responseData = response.data;
                const productsArray = responseData.products || []; // Assuming array is in 'products' root

                // Update Checkpoint based on API response structure
                if (responseData.last_page) {
                    lastPage = responseData.last_page;
                    session.checkpoint.totalPagesFound = lastPage;
                }

                // Process the fetched array
                await this._processProductBatch(productsArray, config, session);

                // Update Checkpoint & Emit Event
                session.checkpoint.lastProcessedPage = currentPage;
                await session.save();
                
                syncEvents.emit(syncEvents.EVENTS.PAGE_PROCESSED, { sessionId: session.sessionId, page: currentPage });

                currentPage++;
                if (productsArray.length === 0 || currentPage > lastPage) hasMore = false;

            } catch (error) {
                session.metrics.apiErrors += 1;
                console.error(`[SyncEngine] Page ${currentPage} fetch failed for ${config.supplierName}:`, error.message);
                // Break loop on critical API failure to prevent infinite loops, session marked as interrupted
                session.status = 'interrupted';
                await session.save();
                throw error;
            }
        }
    }

    // =========================================================
    // 4. The Pipeline (Process Individual Products without Crashing)
    // =========================================================
    async _processProductBatch(rawProductsArray, config, session) {
        for (const rawProduct of rawProductsArray) {
            session.metrics.totalFetched += 1;

            try {
                // Step A: Transform via Adapter
                const standardProduct = universalAdapter.transformToStandard(rawProduct, config.mappingProfile, config.apiConfig.baseUrl);

                // Step B: Validate
                const validation = validationEngine.validate(standardProduct, config.validationRules);
                if (!validation.isValid) {
                    session.metrics.failedValidation += 1;
                    this._logError(session, standardProduct.externalId || 'Unknown', `Validation Failed: ${validation.errors.join(', ')}`);
                    syncEvents.emit(syncEvents.EVENTS.PRODUCT_FAILED, { id: standardProduct.externalId });
                    continue; // Skip to next product
                }

                // Step C: Save to Raw Buffer
                await supplierDal.upsertRawProduct(config._id, standardProduct.externalId, rawProduct, 'pending_review', config.supplierName);

                // Step D: Detect Changes & Route to Unified Repository
                const existingProduct = await supplierDal.findExistingUnifiedProduct(config._id, standardProduct.externalId);

                if (!existingProduct) {
                    // New Product -> Create Draft
                        await supplierDal.createDraftProduct(standardProduct, config._id, config.supplierName, config.importType);
                    session.metrics.newDrafts += 1;
                    syncEvents.emit(syncEvents.EVENTS.PRODUCT_IMPORTED, { id: standardProduct.externalId });
                } else {
                    // Existing Product -> Diffing
                    const diff = changeDetection.detect(existingProduct, standardProduct, config.changeDetectionRules);
                    
                    if (diff.needsReview) {
                        await supplierDal.flagProductForReview(existingProduct._id, diff.reviewNote);
                        session.metrics.sentToReview += 1;
                        syncEvents.emit(syncEvents.EVENTS.REVIEW_REQUIRED, { id: standardProduct.externalId });
                    } else {
                        // Price/Stock unchanged. Depending on Import Policy, we might auto-update variants or just skip.
                        session.metrics.duplicatesSkipped += 1;
                    }
                }

            } catch (error) {
                session.metrics.failedValidation += 1;
                this._logError(session, 'Pipeline_Error', error.message);
            }
        }
    }

    // =========================================================
    // Utilities
    // =========================================================
    async _initializeOrResumeSession(supplierConfig) {
        // Find if there's an interrupted session to resume
        let session = await ImportSessionLog.findOne({ 
            supplierId: supplierConfig._id, 
            status: 'interrupted' 
        }).sort({ 'checkpoint.lastProcessedPage': -1 });

        if (session) {
            session.status = 'running';
            session.startTime = Date.now(); // Reset start time for accurate duration of this run
            await session.save();
            return session;
        }

        // Create new session
        return await ImportSessionLog.create({
            sessionId: `SYNC-${supplierConfig.supplierCode}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
            supplierId: supplierConfig._id
        });
    }

    _logError(session, externalId, reason) {
        session.errorLog.push({ externalId, reason });
        if (session.errorLog.length > 100) session.errorLog.shift(); // Keep log size manageable
    }
}

module.exports = new SyncEngineService();