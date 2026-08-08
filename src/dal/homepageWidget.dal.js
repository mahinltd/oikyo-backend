/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const HomepageWidget = require('../models/homepageWidget.model');

class HomepageWidgetDal {
    async createWidget(data) {
        return await HomepageWidget.create(data);
    }

    async getActiveWidgetsForPublic() {
        const currentDate = new Date();
        
        // Fetch widgets that are visible AND (have no schedule OR are currently active)
        return await HomepageWidget.find({ 
            visibility: true,
            $or: [
                { schedule: { $exists: false } },
                { 'schedule.startTime': null, 'schedule.endTime': null },
                { 'schedule.startTime': { $lte: currentDate }, 'schedule.endTime': { $gte: currentDate } },
                { 'schedule.startTime': { $lte: currentDate }, 'schedule.endTime': null }
            ]
        }).sort({ order: 1 });
    }

    async getAllWidgetsForAdmin() {
        return await HomepageWidget.find().sort({ order: 1 });
    }

    async getWidgetById(id) {
        return await HomepageWidget.findById(id);
    }

    async updateWidget(id, data) {
        return await HomepageWidget.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    async deleteWidget(id) {
        return await HomepageWidget.findByIdAndDelete(id);
    }

    async bulkUpdateOrder(bulkOperations) {
        return await HomepageWidget.bulkWrite(bulkOperations);
    }
}

module.exports = new HomepageWidgetDal();