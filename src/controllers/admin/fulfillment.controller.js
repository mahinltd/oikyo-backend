/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const fulfillmentService = require('../../services/commerce/fulfillment.service');

class FulfillmentController {

    async getTasks(req, res, next) {
        try {
            const { status, page, limit } = req.query;
            const data = await fulfillmentService.getDashboardTasks(status, page, limit);

            res.status(200).json({
                success: true,
                message: 'Fulfillment tasks retrieved successfully',
                data: data.tasks,
                pagination: data.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    async updateTaskStatus(req, res, next) {
        try {
            const { taskId } = req.params;
            const { status, supplierReferenceId } = req.body;
            const adminId = req.user.id;

            const updatedTask = await fulfillmentService.processTaskUpdate(taskId, status, supplierReferenceId, adminId);

            res.status(200).json({
                success: true,
                message: 'Fulfillment task updated successfully',
                data: updatedTask
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new FulfillmentController();