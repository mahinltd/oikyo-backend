/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const reviewQueueService = require('../../services/commerce/reviewQueue.service');
const ApiError = require('../../utils/ApiError');

class ReviewQueueController {

    // Approve a single product and publish it
    async approveProduct(req, res, next) {
        try {
            const { productId } = req.params;
            const adminId = req.user.id;

            const publishedProduct = await reviewQueueService.approveProduct(productId, adminId);

            res.status(200).json({
                success: true,
                message: 'Product approved and published successfully.',
                data: publishedProduct
            });
        } catch (error) {
            next(error);
        }
    }

    // Ignore API changes and keep current data
    async ignoreChanges(req, res, next) {
        try {
            const { productId } = req.params;
            const adminId = req.user.id;

            const product = await reviewQueueService.ignoreChanges(productId, adminId);

            res.status(200).json({
                success: true,
                message: 'Supplier changes ignored. Product removed from review queue.',
                data: product
            });
        } catch (error) {
            next(error);
        }
    }

    // Bulk approve multiple products
    async bulkApprove(req, res, next) {
        try {
            const { productIds } = req.body; // Expecting an array of IDs
            const adminId = req.user.id;

            if (!Array.isArray(productIds) || productIds.length === 0) {
                throw new ApiError(400, 'Please provide an array of product IDs.');
            }

            const results = await reviewQueueService.bulkApproveProducts(productIds, adminId);

            res.status(200).json({
                success: true,
                message: 'Bulk approval process completed.',
                data: results
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ReviewQueueController();