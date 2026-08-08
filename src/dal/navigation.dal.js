/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const HeaderMenu = require('../models/headerMenu.model');
const FooterColumn = require('../models/footerColumn.model');

class NavigationDal {
    // --- Header Operations ---
    async createHeaderMenu(data) {
        return await HeaderMenu.create(data);
    }

    async getVisibleHeaderMenus() {
        // Fetch all visible menus. Service will build the tree.
        return await HeaderMenu.find({ visibility: true }).sort({ order: 1 }).lean();
    }

    async getAllHeaderMenus() {
        return await HeaderMenu.find().sort({ order: 1 }).lean();
    }

    async updateHeaderMenu(id, data) {
        return await HeaderMenu.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    async deleteHeaderMenu(id) {
        // Automatically delete child menus to maintain referential integrity
        await HeaderMenu.deleteMany({ parentId: id });
        return await HeaderMenu.findByIdAndDelete(id);
    }

    // --- Footer Operations ---
    async createFooterColumn(data) {
        return await FooterColumn.create(data);
    }

    async getVisibleFooterColumns() {
        return await FooterColumn.find({ visibility: true }).sort({ order: 1 });
    }

    async getAllFooterColumns() {
        return await FooterColumn.find().sort({ order: 1 });
    }

    async updateFooterColumn(id, data) {
        return await FooterColumn.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    async deleteFooterColumn(id) {
        return await FooterColumn.findByIdAndDelete(id);
    }
}

module.exports = new NavigationDal();