/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Order = require('../../models/order/order.model');
const User = require('../../models/user.model'); // Import User model to get full user details
const ApiError = require('../../utils/ApiError');
const eventBus = require('../../services/communication/eventBus.service');

class CheckoutController {
    
    /**
     * Place New Order (Public/Authenticated)
     * POST /api/v1/public/checkout
     */
    async placeOrder(req, res, next) {
        try {
            const { items, subTotal, shippingFee, discountAmount, totalAmount, shippingAddress, paymentInfo } = req.body;
            const customerId = req.user.id; // From auth middleware
            
            // Get full user details to access email and fullName
            const user = await User.findById(customerId).select('email fullName');
            if (!user) {
                throw new ApiError(404, 'User not found.');
            }
            
            const customerEmail = user.email;
            const customerName = user.fullName;

            // 1. Basic Validation
            if (!items || items.length === 0) throw new ApiError(400, 'Cart is empty');
            if (!shippingAddress) throw new ApiError(400, 'Shipping address is required');
            
            if (paymentInfo.method !== 'COD' && !paymentInfo.transactionId) {
                throw new ApiError(400, 'Transaction ID is required for manual MFS payments');
            }

            // 2. Create the Order
            const newOrder = await Order.create({
                customer: customerId,
                items,
                subTotal,
                shippingFee,
                discountAmount,
                totalAmount,
                shippingAddress,
                paymentInfo: {
                    method: paymentInfo.method,
                    transactionId: paymentInfo.method === 'COD' ? null : paymentInfo.transactionId,
                    amountPaid: paymentInfo.method === 'COD' ? 0 : totalAmount,
                    paymentStatus: paymentInfo.method === 'COD' ? 'cod_unpaid' : 'pending'
                },
                orderStatus: paymentInfo.method === 'COD' ? 'processing' : 'pending_payment',
                timeline: [{
                    status: paymentInfo.method === 'COD' ? 'processing' : 'pending_payment',
                    note: 'Order placed by customer.',
                    updatedBy: customerId
                }]
            });

            // ==========================================
            // 3. FIRING NOTIFICATIONS VIA EVENT BUS
            // ==========================================

            // A) Notify Customer (Email, Push, In-App based on their preferences)
            eventBus.publish('order_confirmation', 
                { email: customerEmail, userId: customerId, userRole: 'customer' },
                {
                    customerName: customerName,
                    orderNumber: newOrder.orderNumber,
                    totalAmount: totalAmount,
                    paymentMethod: paymentInfo.method,
                    trackingLink: `https://oikyo.me/account/orders/${newOrder.orderNumber}`
                }
            );

            // B) Notify Admin (In-App Dashboard Bell Icon + Internal Email)
            // By passing userRole: 'admin', the Event Bus saves it to the Admin's In-App Notification Center
            eventBus.publish('new_order_alert', 
                { userId: 'admin_group', userRole: 'admin' }, // Triggers In-App for admins
                {
                    notificationTitle: `New Order: ${newOrder.orderNumber}`,
                    notificationMessage: `A new order of ৳${totalAmount} has been placed via ${paymentInfo.method}.`,
                    actionUrl: `/admin/orders/${newOrder._id}`
                }
            );

            // 4. Send Response
            res.status(201).json({
                success: true,
                message: 'Order placed successfully!',
                data: {
                    orderNumber: newOrder.orderNumber,
                    status: newOrder.orderStatus
                }
            });

        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CheckoutController();