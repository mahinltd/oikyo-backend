/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

function normalizeOriginType(originType) {
    if (!originType) return 'supplier_api';
    if (originType === 'api') return 'supplier_api';
    if (originType === 'manual') return 'manual';
    return originType;
}

function buildRawProductUpsertPayload(supplierId, externalProductId, rawPayload, status = 'pending_review', supplierName) {
    return {
        supplierId,
        externalProductId,
        supplierName: supplierName || '',
        rawPayload,
        importStatus: status,
        lastSyncTime: new Date()
    };
}

module.exports = {
    normalizeOriginType,
    buildRawProductUpsertPayload
};
