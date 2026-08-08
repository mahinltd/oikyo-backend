/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const publicProductService = require('../../services/commerce/publicProduct.service');

class PublicProductController {

    // Retrieve a list of products (Handles Search, Filter, Pagination)
    async getProducts(req, res, next) {
        try {
            const data = await publicProductService.getProductsList(req.query);

            res.status(200).json({
                success: true,
                message: 'Products retrieved successfully',
                data: data.products,
                pagination: data.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    // Retrieve full details of a single product for the Product Details Page (PDP)
    async getProductDetails(req, res, next) {
        try {
            const { slug } = req.params;
            const product = await publicProductService.getProductBySlug(slug);

            res.status(200).json({
                success: true,
                message: 'Product details retrieved successfully',
                data: product
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PublicProductController();