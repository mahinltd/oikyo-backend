/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const taxonomyService = require('../../services/wme/taxonomy.service');
const taxonomyDal = require('../../dal/wme/taxonomy.dal'); // Allowed only for simple GET operations

class TaxonomyController {

    async getAllCategories(req, res, next) {
        try {
            const categories = await taxonomyDal.getAllCategories();
            res.status(200).json({ success: true, data: categories });
        } catch (error) {
            next(error);
        }
    }

    async createCategory(req, res, next) {
        try {
            const adminId = req.user.id;
            const category = await taxonomyService.createCategory(req.body, adminId);
            res.status(201).json({ success: true, data: category });
        } catch (error) {
            next(error);
        }
    }

    async updateCategory(req, res, next) {
        try {
            const { id } = req.params;
            const adminId = req.user.id;
            const category = await taxonomyService.updateCategory(id, req.body, adminId);
            res.status(200).json({ success: true, data: category });
        } catch (error) {
            next(error);
        }
    }

    async createBrand(req, res, next) {
        try {
            const brand = await taxonomyService.createBrand(req.body, req.user?.id);
            res.status(201).json({ success: true, data: brand });
        } catch (error) {
            next(error);
        }
    }

    async getAllBrands(req, res, next) {
        try {
            const brands = await taxonomyDal.getAllBrands();
            res.status(200).json({ success: true, data: brands });
        } catch (error) {
            next(error);
        }
    }

    async updateBrand(req, res, next) {
        try {
            const { id } = req.params;
            const brand = await taxonomyService.updateBrand(id, req.body, req.user?.id);
            res.status(200).json({ success: true, data: brand });
        } catch (error) {
            next(error);
        }
    }

    async toggleCategoryStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { isActive } = req.body;
            const adminId = req.user.id;
            
            const category = await taxonomyService.toggleCategoryStatus(id, isActive, adminId);
            res.status(200).json({ success: true, data: category });
        } catch (error) {
            next(error);
        }
    }

    async reorderCategories(req, res, next) {
        try {
            const adminId = req.user.id;
            // Expecting array of { id, displayOrder }
            const result = await taxonomyService.reorderCategories(req.body.orderedItems, adminId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new TaxonomyController();