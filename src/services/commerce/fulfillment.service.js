/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const fulfillmentDal = require('../../dal/commerce/fulfillment.dal');
const ApiError = require('../../utils/ApiError');
// const auditService = require('../system/audit.service');

class FulfillmentService {

    // Retrieve tasks for the support team dashboard
    async getDashboardTasks(statusFilter, page = 1, limit = 20) {
        const filter = {};
        if (statusFilter) {
            filter.status = statusFilter;
        } else {
            // Default: Show actionable tasks
            filter.status = { $in: ['pending_supplier_order', 'ordered_from_supplier', 'received_at_warehouse'] };
        }

        const skip = (page - 1) * limit;
        const tasks = await fulfillmentDal.getTasks(filter, skip, limit);
        const total = await fulfillmentDal.countTasks(filter);

        return {
            tasks,
            pagination: {
                total,
                page: Number(page),
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // Process status update by Support/Fulfillment Team
    async processTaskUpdate(taskId, newStatus, supplierReferenceId, adminId) {
        const task = await fulfillmentDal.getTaskById(taskId);
        if (!task) throw new ApiError(404, 'Fulfillment task not found');

        const validTransitions = {
            'pending_supplier_order': ['ordered_from_supplier', 'supplier_out_of_stock', 'cancelled'],
            'ordered_from_supplier': ['received_at_warehouse', 'shipped_to_customer', 'cancelled'],
            'received_at_warehouse': ['shipped_to_customer'],
            'shipped_to_customer': ['delivered', 'cancelled'],
            'supplier_out_of_stock': ['cancelled'],
            'cancelled': [],
            'delivered': []
        };

        if (!validTransitions[task.status].includes(newStatus)) {
            throw new ApiError(400, `Invalid status transition from '${task.status}' to '${newStatus}'`);
        }

        // Business Rule: Must provide supplier reference ID when marking as ordered
        if (newStatus === 'ordered_from_supplier' && !supplierReferenceId) {
            throw new ApiError(400, 'Supplier Order Reference ID is required when marking a task as ordered from the supplier.');
        }

        const updateData = { status: newStatus };
        if (supplierReferenceId) {
            updateData.supplierOrderReferenceId = supplierReferenceId;
        }

        const updatedTask = await fulfillmentDal.updateTaskStatus(taskId, updateData);

        // Audit Trail implementation
        // await auditService.log('fulfillment_status_updated', adminId, { taskId, oldStatus: task.status, newStatus });

        return updatedTask;
    }
}

module.exports = new FulfillmentService();