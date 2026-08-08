/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const OrderFulfillment = require('../../models/commerce/orderFulfillment.model');

class FulfillmentDal {
    async getTasks(filter = {}, skip = 0, limit = 20) {
        return await OrderFulfillment.find(filter)
            .populate('orderId', 'orderNumber customerDetails createdAt') // Assuming Order model exists
            .populate('productId', 'title sku media.thumbnail')
            .sort({ createdAt: 1 }) // Oldest pending tasks first
            .skip(skip)
            .limit(limit)
            .lean();
    }

    async countTasks(filter = {}) {
        return await OrderFulfillment.countDocuments(filter);
    }

    async getTaskById(taskId) {
        return await OrderFulfillment.findById(taskId);
    }

    async updateTaskStatus(taskId, updateData) {
        return await OrderFulfillment.findByIdAndUpdate(taskId, updateData, { new: true });
    }
}

module.exports = new FulfillmentDal();