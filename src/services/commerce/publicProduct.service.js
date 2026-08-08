/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Product = require('../../models/commerce/product.model');
const ApiError = require('../../utils/ApiError');

class PublicProductService {

    // ==========================================
    // Core Visibility Gatekeeper Rule
    // ==========================================
    getBaseVisibilityConditions(currentDate = new Date()) {
        return [
            { status: 'published' },
            { 'editorState.isHidden': false },
            {
                $or: [
                    { 'publishing.publishAt': null },
                    { 'publishing.publishAt': { $lte: currentDate } }
                ]
            },
            {
                $or: [
                    { 'publishing.unpublishAt': null },
                    { 'publishing.unpublishAt': { $gte: currentDate } }
                ]
            }
        ];
    }

    buildListQuery(queryParams = {}) {
        const { search, category, minPrice, maxPrice, inStock } = queryParams;

        const conditions = [...this.getBaseVisibilityConditions()];

        if (category) conditions.push({ category });
        if (inStock === 'true') conditions.push({ 'inventory.stockStatus': 'in_stock' });

        if (minPrice || maxPrice) {
            const priceFilter = {};
            if (minPrice) priceFilter.$gte = Number(minPrice);
            if (maxPrice) priceFilter.$lte = Number(maxPrice);
            conditions.push({ 'pricing.sellingPrice': priceFilter });
        }

        if (search) {
            const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const searchPattern = new RegExp(sanitizedSearch, 'i');
            conditions.push({
                $or: [
                    { 'inventory.sku': { $regex: new RegExp(`^${sanitizedSearch}$`, 'i') } },
                    { title: { $regex: searchPattern } },
                    { tags: { $in: [searchPattern] } }
                ]
            });
        }

        return { $and: conditions };
    }

    buildSlugQuery(slug) {
        return {
            $and: [
                ...this.getBaseVisibilityConditions(),
                { slug: slug.toLowerCase() }
            ]
        };
    }

    // ==========================================
    // DTO Projections (Strict Exclusion Protocol)
    // ==========================================
    getCardDTOProjection() {
        return {
            title: 1,
            slug: 1,
            'media.thumbnail': 1,
            'pricing.sellingPrice': 1,
            'pricing.comparePrice': 1,
            'inventory.stockStatus': 1,
            'badges.isFeatured': 1,
            createdAt: 1 // Needed for sorting
        };
    }

    getDetailsDTOProjection() {
        return {
            title: 1,
            slug: 1,
            description: 1,
            tags: 1,
            category: 1,
            brand: 1,
            media: 1, // Includes full gallery
            'pricing.sellingPrice': 1,
            'pricing.comparePrice': 1,
            'inventory.sku': 1,
            'inventory.stockStatus': 1,
            'inventory.stockQuantity': 1,
            variants: 1,
            seo: 1
        };
    }

    // ==========================================
    // Search, Filter & Pagination Pipeline
    // ==========================================
    async getProductsList(queryParams) {
        const { search, sort, page = 1, limit = 20 } = queryParams;

        const query = this.buildListQuery(queryParams);

        // 3. Sorting Rules
        let sortOption = { createdAt: -1 }; // Default: Newest Arrivals
        if (sort === 'price_asc') sortOption = { 'pricing.sellingPrice': 1 };
        if (sort === 'price_desc') sortOption = { 'pricing.sellingPrice': -1 };
        if (sort === 'relevance' && search) sortOption = { createdAt: -1 }; // Best-effort fallback until text ranking is introduced

        // 4. Execute Query with Pagination
        const skip = (page - 1) * limit;
        
        const products = await Product.find(query)
            .select(this.getCardDTOProjection())
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit))
            .lean(); // Lean for extreme performance (Returns pure JSON, not Mongoose documents)

        const totalCount = await Product.countDocuments(query);

        return {
            products,
            pagination: {
                total: totalCount,
                page: Number(page),
                totalPages: Math.ceil(totalCount / limit)
            }
        };
    }

    // ==========================================
    // Get Single Product Details (By Slug)
    // ==========================================
    async getProductBySlug(slug) {
        const query = this.buildSlugQuery(slug);

        const product = await Product.findOne(query)
            .select(this.getDetailsDTOProjection())
            .populate('category', 'name slug')
            .populate('brand', 'name slug logo')
            .lean();

        if (!product) {
            throw new ApiError(404, 'Product not found or is currently unavailable.');
        }

        return product;
    }
}

module.exports = new PublicProductService();