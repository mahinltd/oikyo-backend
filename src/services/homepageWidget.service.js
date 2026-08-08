/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const widgetDal = require('../dal/homepageWidget.dal');
const ApiError = require('../utils/ApiError');

class HomepageWidgetService {
    
    async addWidget(data) {
        return await widgetDal.createWidget(data);
    }

    async getPublicLayout() {
        // Here we just return the structural JSON. 
        // Frontend will use this configuration to hit specific Catalog APIs.
        return await widgetDal.getActiveWidgetsForPublic();
    }

    async getAdminLayout() {
        return await widgetDal.getAllWidgetsForAdmin();
    }

    async updateWidget(id, data) {
        const updated = await widgetDal.updateWidget(id, data);
        if (!updated) throw new ApiError(404, 'Widget not found');
        return updated;
    }

    async removeWidget(id) {
        const removed = await widgetDal.deleteWidget(id);
        if (!removed) throw new ApiError(404, 'Widget not found');
        return removed;
    }

    async reorderWidgets(widgets) {
        const bulkOperations = widgets.map((widget) => ({
            updateOne: {
                filter: { _id: widget.id },
                update: { $set: { order: widget.order } }
            }
        }));
        await widgetDal.bulkUpdateOrder(bulkOperations);
        return { success: true, message: 'Homepage layout reordered successfully.' };
    }
}

module.exports = new HomepageWidgetService();