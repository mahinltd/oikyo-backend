/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const catalogService = require('../../services/catalog.service');
const { isAuthenticated } = require('../../middlewares/auth.middleware');
const { restrictToRoles } = require('../../middlewares/role.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const router = express.Router();

// ==========================================
// Public Routes (Used by Frontend / Vercel)
// ==========================================
router.get('/categories/tree', asyncHandler(async (req, res) => {
    const categoryTree = await catalogService.getPublicCategoryTree();
    res.status(200).json(new ApiResponse(200, categoryTree, "Multi-level category tree fetched"));
}));

// ==========================================
// Protected Admin Routes
// ==========================================
router.use(isAuthenticated, restrictToRoles('super_admin', 'admin', 'manager'));

// Category Management
router.get('/admin/categories', asyncHandler(async (req, res) => {
    const data = await catalogService.getAdminCategoryList();
    res.status(200).json(new ApiResponse(200, data, "Admin category list fetched"));
}));

router.post('/admin/categories', asyncHandler(async (req, res) => {
    const category = await catalogService.createCategory(req.body);
    res.status(201).json(new ApiResponse(201, category, "Category created successfully"));
}));

router.put('/admin/categories/:id', asyncHandler(async (req, res) => {
    const category = await catalogService.updateCategory(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, category, "Category updated successfully"));
}));

router.delete('/admin/categories/:id', asyncHandler(async (req, res) => {
    await catalogService.deleteCategory(req.params.id);
    res.status(200).json(new ApiResponse(200, null, "Category and its sub-categories deleted"));
}));

// Placeholder routes for Brands and Collections (Admin implementation follows identical pattern)
// router.post('/admin/brands', ...);
// router.post('/admin/collections', ...);

module.exports = router;