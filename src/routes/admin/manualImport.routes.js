/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const router = express.Router();
const manualImportController = require('../../controllers/admin/manualImport.controller');
const { requireAuth, requireAdmin } = require('../../middlewares/auth.middleware');

router.use(requireAuth, requireAdmin);

router.post('/single', manualImportController.importSingle);
router.post('/bulk', manualImportController.importBulk);

module.exports = router;