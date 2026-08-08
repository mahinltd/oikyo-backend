/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Order = require('../../models/order/order.model');
const ApiError = require('../../utils/ApiError');
const eventBus = require('../../services/communication/eventBus.service');

class PaymentVerificationController {
    
    /**
     * Verify or Reject Manual MFS Payment (Admin Only)
     * POST /api/v1/admin/payments/:orderId/verify
     */
    async verifyManualPayment(req, res, next) {
        try {
            const { orderId } = req.params;
            const { status, adminNotes } = req.body; // status: 'verified' or 'failed'
            const adminId = req.user.id;

            if (!['verified', 'failed'].includes(status)) {
                throw new ApiError(400, 'Invalid payment status provided.');
            }

            const order = await Order.findById(orderId).populate('customer', 'email fullName');
            if (!order) throw new ApiError(404, 'Order not found.');

            if (order.paymentInfo.paymentStatus !== 'pending') {
                throw new ApiError(400, `Payment is already marked as ${order.paymentInfo.paymentStatus}.`);
            }

            // Update Payment Status
            order.paymentInfo.paymentStatus = status;
            
            if (status === 'verified') {
                order.paymentInfo.verifiedBy = adminId;
                order.paymentInfo.verifiedAt = new Date();
                order.orderStatus = 'processing'; // Move order to processing stage
            } else {
                order.orderStatus = 'payment_failed';
            }

            // Save admin notes to order timeline (assuming timeline array exists in Order schema)
            order.timeline.push({
                status: order.orderStatus,
                note: adminNotes || `Payment marked as ${status} by Admin.`,
                updatedBy: adminId
            });

            await order.save();

            // Fire Event to Notification Engine
            const eventName = status === 'verified' ? 'payment_received' : 'payment_failed';
            eventBus.publish(eventName, 
                { email: order.customer.email, userId: order.customer._id, userRole: 'customer' },
                { 
                    customerName: order.customer.fullName, 
                    orderNumber: order.orderNumber,
                    transactionId: order.paymentInfo.transactionId,
                    amount: order.paymentInfo.amountPaid
                }
            );

            res.status(200).json({
                success: true,
                message: `Payment successfully marked as ${status}.`,
                data: order.paymentInfo
            });

        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PaymentVerificationController();