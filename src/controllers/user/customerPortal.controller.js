/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Order = require('../../models/order/order.model');
const User = require('../../models/user.model'); // Fixed path to correct user model
const ApiError = require('../../utils/ApiError');

class CustomerPortalController {
    
    /**
     * Get Customer's Own Profile
     * GET /api/v1/customer/profile
     */
    async getMyProfile(req, res, next) {
        try {
            const customerId = req.user.id;
            // Fetch user but exclude sensitive data like password
            const profile = await User.findById(customerId).select('-password -__v -role');
            
            if (!profile) throw new ApiError(404, 'Profile not found.');

            res.status(200).json({
                success: true,
                data: profile
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get Customer's Own Order History
     * GET /api/v1/customer/orders?page=1&limit=10
     */
    async getMyOrders(req, res, next) {
        try {
            const customerId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Fetch only orders belonging to the logged-in customer, sorted by newest first
            const orders = await Order.find({ customer: customerId })
                .select('orderNumber totalAmount orderStatus paymentInfo.paymentStatus createdAt')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await Order.countDocuments({ customer: customerId });

            res.status(200).json({
                success: true,
                data: orders,
                pagination: {
                    page,
                    limit,
                    totalOrders: total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get Specific Order Details for Tracking
     * GET /api/v1/customer/orders/:orderNumber
     */
    async getSingleOrderDetails(req, res, next) {
        try {
            const customerId = req.user.id;
            const { orderNumber } = req.params;

            const order = await Order.findOne({ orderNumber, customer: customerId })
                .populate('items.product', 'title slug media.thumbnail'); // Assuming product has these fields

            if (!order) throw new ApiError(404, 'Order not found or you do not have permission to view it.');

            res.status(200).json({
                success: true,
                data: order
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CustomerPortalController();