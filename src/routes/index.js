/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const router = express.Router();

// ==========================================
// 1. Authentication Routes
// ==========================================
router.use('/auth', require('./auth.routes'));

// ==========================================
// 2. Public Website Routes (Frontend Consumers)
// ==========================================
// Exposes safe DTOs (Data Transfer Objects) to the frontend, hiding sensitive data
router.use('/public/products', require('./public/product.routes'));
router.use('/storefront/assistant', require('./storefront/coAssistant.routes')); // AI Assistant for public users
router.use('/public/checkout', require('./public/checkout.routes'));
router.use('/customer', require('./public/customerPortal.routes'));

// ==========================================
// 3. WME (Website Management Engine) Routes
// ==========================================
// Existing configurations
router.use('/wme/identity', require('./wme/websiteIdentity.routes'));
router.use('/wme/assets', require('./wme/globalAsset.routes'));
router.use('/wme/theme', require('./wme/theme.routes'));
router.use('/wme/navigation', require('./wme/navigation.routes'));
router.use('/wme/cms', require('./wme/cms.routes'));
router.use('/wme/catalog', require('./wme/catalog.routes'));
router.use('/wme/seo', require('./wme/seo.routes'));
router.use('/wme/contact', require('./wme/contact.routes'));
router.use('/wme/announcement', require('./wme/announcement.routes'));
router.use('/wme/maintenance', require('./wme/maintenance.routes'));
router.use('/wme/features', require('./wme/featureToggle.routes'));
router.use('/wme/localization', require('./wme/localization.routes'));
router.use('/wme/homepage', require('./wme/homepage.routes'));
// Newly mapped from AI Audit
router.use('/wme/media', require('./wme/media.routes')); 
router.use('/wme/notification-templates', require('./wme/notificationTemplate.routes')); 

// ==========================================
// 4. Admin Dashboard Routes (Commerce Core)
// ==========================================
// Product Curation & Operations
router.use('/admin/products', require('./admin/productEditor.routes'));
router.use('/admin/dashboard', require('./admin/dashboard.routes'));
router.use('/admin/manual-import', require('./admin/manualImport.routes'));
router.use('/admin/suppliers', require('./admin/supplier.routes'));
router.use('/admin/review-queue', require('./admin/reviewQueue.routes'));

// Operations & Order Management
router.use('/admin/fulfillment', require('./admin/fulfillment.routes')); 

// Taxonomy & Structure (WME Taxonomy)
router.use('/admin/taxonomy', require('./admin/taxonomy.routes'));

// Payment Verification
router.use('/admin/payments', require('./admin/payment.routes')); // Added payment routes

// AI Automation
router.use('/admin/ai-editor', require('./admin/aiEditorAssistant.routes'));
router.use('/admin/ai-providers', require('./admin/aiProvider.routes'));

// ==========================================
// 5. Unified Notification Engine Routes
// ==========================================
// Communication & Preferences
router.use('/notifications/preferences', require('./communication/notificationPreference.routes'));
router.use('/notifications/fcm-token', require('./communication/fcmToken.routes')); // Added FCM token routes
// router.use('/admin/notifications/audit', require('./communication/notificationAudit.routes')); // Keep commented until created

module.exports = router;