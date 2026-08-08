/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const OrderFulfillment = require('../../models/commerce/orderFulfillment.model');
const Product = require('../../models/commerce/product.model');
const ApiError = require('../../utils/ApiError');

class FulfillmentEngineService {

    /**
     * Generates a fulfillment tracking record when a customer places a new order.
     * @param {Object} orderContext - The finalized order from the Checkout Engine
     */
    async generateFulfillmentTask(orderContext, orderItems) {
        const tasks = [];

        for (const item of orderItems) {
            const product = await Product.findById(item.productId);
            if (!product) continue;

            const profit = item.sellingPrice - product.pricing.costPrice;

            const fulfillmentTask = await OrderFulfillment.create({
                orderId: orderContext.orderId,
                productId: product._id,
                source: {
                    originType: product.source.originType,
                    supplierId: product.source.supplierId,
                    supplierName: product.source.supplierName,
                    externalProductId: product.source.externalProductId,
                    sourceUrl: product.source.sourceUrl
                },
                financials: {
                    costPriceAtOrder: product.pricing.costPrice,
                    sellingPriceAtOrder: item.sellingPrice,
                    calculatedProfit: profit
                },
                fulfillmentInstruction: product.source.fulfillmentInstruction
            });

            tasks.push(fulfillmentTask);
        }

        return tasks;
    }

    /**
     * Updates the status of the fulfillment task as the admin processes it.
     */
    async updateTaskStatus(taskId, newStatus, supplierReference = null) {
        const task = await OrderFulfillment.findById(taskId);
        if (!task) throw new ApiError(404, 'Fulfillment task not found');

        task.status = newStatus;
        if (supplierReference) {
            task.supplierOrderReferenceId = supplierReference;
        }

        await task.save();
        return task;
    }
}

module.exports = new FulfillmentEngineService();