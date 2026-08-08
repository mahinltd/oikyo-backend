/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const router = express.Router();
const aiEditorAssistantController = require('../../controllers/admin/aiEditorAssistant.controller');
const { requireAuth, requireAdmin } = require('../../middlewares/auth.middleware');

router.use(requireAuth, requireAdmin);

router.post('/execute-task', aiEditorAssistantController.executeEditorTask);

module.exports = router;