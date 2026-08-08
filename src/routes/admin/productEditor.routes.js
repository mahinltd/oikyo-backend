/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const router = express.Router();
const productEditorController = require('../../controllers/admin/productEditor.controller');
const { requireAuth, requireAdmin } = require('../../middlewares/auth.middleware');

router.use(requireAuth, requireAdmin);

router.get('/:productId/edit', productEditorController.openForEdit);
router.put('/:productId/draft', productEditorController.saveDraft);
router.post('/:productId/submit-review', productEditorController.submitForReview);

module.exports = router;