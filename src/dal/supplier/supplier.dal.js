/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const SupplierConfig = require('../../models/supplier/supplierConfig.model');
const RawProductImport = require('../../models/supplier/rawProductImport.model');
const Product = require('../../models/commerce/product.model');
const { normalizeOriginType } = require('../../services/supplier/supplierImport.helpers');
// Note: ImportSessionLog model will be created later for Audit Trail

class SupplierDal {
    
    // ==========================================
    // Configuration Fetching
    // ==========================================
    async getActiveSuppliers() {
        // Fetch all active API suppliers to run the cron job
        return await SupplierConfig.find({ 
            'syncConfig.isActive': true, 
            importType: 'api' 
        }).lean();
    }

    // ==========================================
    // Raw Buffer Operations
    // ==========================================
    async upsertRawProduct(supplierId, externalProductId, rawPayload, status = 'pending_review', supplierName = '') {
        return await RawProductImport.findOneAndUpdate(
            { supplierId, externalProductId },
            { 
                supplierId,
                externalProductId,
                supplierName,
                rawPayload,
                importStatus: status,
                lastSyncTime: new Date() 
            },
            { new: true, upsert: true }
        );
    }

    // ==========================================
    // Unified Repository Operations
    // ==========================================
    async findExistingUnifiedProduct(supplierId, externalProductId) {
        return await Product.findOne({
            'source.supplierId': supplierId,
            'source.externalProductId': externalProductId
        }).lean();
    }

    async createDraftProduct(standardProduct, supplierConfigId, supplierName, originType = 'supplier_api') {
        const normalizedOriginType = normalizeOriginType(originType);

        // Transform Standard Product to Database Schema format
        const costPrice = standardProduct.pricing.costPrice;
        const sellingPrice = standardProduct.pricing.salePrice ?? standardProduct.pricing.regularPrice ?? costPrice;
        const comparePrice = standardProduct.pricing.regularPrice && standardProduct.pricing.regularPrice !== sellingPrice
            ? standardProduct.pricing.regularPrice
            : null;

        const productData = {
            title: standardProduct.title,
            slug: `${standardProduct.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${standardProduct.externalId}`,
            description: standardProduct.description,
            tags: standardProduct.tags || [],
            media: {
                thumbnail: standardProduct.media?.thumbnail || null,
                gallery: standardProduct.media?.gallery || []
            },
            pricing: {
                costPrice: costPrice,
                markupPercentage: 0,
                sellingPrice: sellingPrice,
                comparePrice: comparePrice
            },
            sku: standardProduct.inventory?.sku || `SKU-${standardProduct.externalId}`,
            variants: standardProduct.variants || [],
            stockStatus: standardProduct.inventory?.stockStatus || 'in_stock',
            stockQuantity: standardProduct.inventory?.stockQuantity || 0,
            source: {
                originType: normalizedOriginType,
                supplierId: supplierConfigId,
                externalProductId: standardProduct.externalId
            },
            seo: standardProduct.seo || {},
            status: 'draft',
            editorState: {
                isDirty: false,
                lockedBy: null,
                lockExpiry: null,
                qualityScore: 0
            }
        };

        return await Product.create(productData);
    }

    async flagProductForReview(productId, reviewNote) {
        return await Product.findByIdAndUpdate(
            productId,
            { 
                $set: { 
                    'changeDetection.needsReview': true,
                    'changeDetection.reviewNote': reviewNote,
                    status: 'pending_review' // Change status so Admin sees it in Review Queue
                }
            },
            { new: true }
        );
    }
}

module.exports = new SupplierDal();