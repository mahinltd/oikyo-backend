/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const multer = require('multer');
const mediaController = require('../../controllers/media.controller');
const { isAuthenticated } = require('../../middlewares/auth.middleware');
const { restrictToRoles } = require('../../middlewares/role.middleware');

const router = express.Router();

// Configure Multer for temporary local storage before Cloudinary upload
const upload = multer({ dest: 'src/uploads/temp/' });

// ==========================================
// Protected Admin Routes (Media is managed by Admin only)
// ==========================================
router.use(isAuthenticated, restrictToRoles('super_admin', 'admin', 'manager'));

// Folder Routes
router.post('/folder', mediaController.createFolder);
router.get('/folder', mediaController.getFolders);

// Media Item Routes
// 'upload.single('file')' extracts the file from the request
router.post('/upload', upload.single('file'), mediaController.uploadMedia);
router.get('/library', mediaController.getMediaLibrary);
router.delete('/:id', mediaController.deleteMedia);

module.exports = router;