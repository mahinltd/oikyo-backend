/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const navigationDal = require('../dal/navigation.dal');
const ApiError = require('../utils/ApiError');

class NavigationService {
    
    // Helper function to build nested tree
    _buildMenuTree(menus, parentId = null) {
        const tree = [];
        for (let menu of menus) {
            // Check if stringified ID matches the parentId
            if (String(menu.parentId) === String(parentId)) {
                const children = this._buildMenuTree(menus, menu._id);
                if (children.length > 0) {
                    menu.children = children;
                } else {
                    menu.children = [];
                }
                tree.push(menu);
            }
        }
        return tree;
    }

    // --- Header Services ---
    async createHeaderMenu(data) {
        return await navigationDal.createHeaderMenu(data);
    }

    async getPublicHeaderTree() {
        const rawMenus = await navigationDal.getVisibleHeaderMenus();
        return this._buildMenuTree(rawMenus, null); // Build and return nested tree
    }

    async getAdminHeaderList() {
        // Admin needs both flat list and tree for easier management
        const rawMenus = await navigationDal.getAllHeaderMenus();
        const tree = this._buildMenuTree(rawMenus, null);
        return { list: rawMenus, tree };
    }

    async updateHeaderMenu(id, data) {
        const updated = await navigationDal.updateHeaderMenu(id, data);
        if (!updated) throw new ApiError(404, 'Header menu not found');
        return updated;
    }

    async deleteHeaderMenu(id) {
        const deleted = await navigationDal.deleteHeaderMenu(id);
        if (!deleted) throw new ApiError(404, 'Header menu not found');
        return true;
    }

    // --- Footer Services ---
    async createFooterColumn(data) {
        return await navigationDal.createFooterColumn(data);
    }

    async getPublicFooterLayout() {
        return await navigationDal.getVisibleFooterColumns();
    }

    async getAdminFooterLayout() {
        return await navigationDal.getAllFooterColumns();
    }

    async updateFooterColumn(id, data) {
        const updated = await navigationDal.updateFooterColumn(id, data);
        if (!updated) throw new ApiError(404, 'Footer column not found');
        return updated;
    }

    async deleteFooterColumn(id) {
        const deleted = await navigationDal.deleteFooterColumn(id);
        if (!deleted) throw new ApiError(404, 'Footer column not found');
        return true;
    }
}

module.exports = new NavigationService();