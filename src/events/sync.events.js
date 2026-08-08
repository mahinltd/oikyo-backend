/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const EventEmitter = require('events');

class SyncEventEmitter extends EventEmitter {}

const syncEvents = new SyncEventEmitter();

// Define Event Constants
syncEvents.EVENTS = {
    SYNC_STARTED: 'sync_started',
    PAGE_PROCESSED: 'page_processed',
    PRODUCT_IMPORTED: 'product_imported',
    PRODUCT_UPDATED: 'product_updated',
    PRODUCT_FAILED: 'product_failed',
    REVIEW_REQUIRED: 'review_required',
    SYNC_COMPLETED: 'sync_completed',
    SYNC_FAILED: 'sync_failed'
};

module.exports = syncEvents;