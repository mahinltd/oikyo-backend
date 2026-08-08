/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Order = require('../../models/order/order.model');
const User = require('../../models/user.model'); // Fixed path to correct user model
const ApiError = require('../../utils/ApiError');

class DashboardController {
    
    /**
     * Get Admin Dashboard Statistics & Analytics
     * GET /api/v1/admin/dashboard/stats
     */
    async getAnalytics(req, res, next) {
        try {
            // Using Promise.all to run all queries concurrently for maximum performance
            const [
                totalCustomers,
                pendingOrdersCount,
                salesData,
                recentOrders
            ] = await Promise.all([
                // 1. Total Customers Count
                User.countDocuments({ role: 'customer' }),
                
                // 2. Pending Orders Count (Needs attention)
                Order.countDocuments({ 
                    orderStatus: { $in: ['pending_payment', 'processing'] } 
                }),
                
                // 3. Total Revenue Calculation (Aggregation)
                Order.aggregate([
                    { 
                        $match: { 
                            'paymentInfo.paymentStatus': { $in: ['verified', 'cod_unpaid'] },
                            orderStatus: { $ne: 'cancelled' }
                        } 
                    },
                    { 
                        $group: { 
                            _id: null, 
                            totalRevenue: { $sum: '$totalAmount' },
                            totalSuccessfulOrders: { $sum: 1 }
                        } 
                    }
                ]),
                
                // 4. Latest 5 Orders for the Recent Orders Table
                Order.find()
                    .select('orderNumber customer totalAmount orderStatus paymentInfo.method createdAt')
                    .populate('customer', 'fullName email')
                    .sort({ createdAt: -1 })
                    .limit(5)
            ]);

            // Formatting Sales Data from Aggregation Pipeline
            const revenue = salesData.length > 0 ? salesData[0].totalRevenue : 0;
            const successfulOrders = salesData.length > 0 ? salesData[0].totalSuccessfulOrders : 0;

            res.status(200).json({
                success: true,
                data: {
                    overview: {
                        totalRevenue: revenue,
                        totalCustomers,
                        pendingOrders: pendingOrdersCount,
                        totalSuccessfulOrders: successfulOrders
                    },
                    recentOrders
                }
            });

        } catch (error) {
            next(error);
        }
    }
}

module.exports = new DashboardController();