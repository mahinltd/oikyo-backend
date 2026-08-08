/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const axios = require('axios');
const cloudinary = require('../../config/cloudinary.config'); // Assuming cloudinary is configured
const Product = require('../../models/commerce/product.model');
const crypto = require('crypto');
const productEditorService = require('../commerce/productEditor.service');

class MediaImportManager {

    /**
     * Background process to download external images and upload to Cloudinary.
     * @param {String} productId - The Unified Product ID
     * @param {Array} externalUrls - Array of image URLs from the supplier
     */
    async processProductMedia(productId, externalUrls) {
        if (!externalUrls || externalUrls.length === 0) return;

        const product = await Product.findById(productId);
        if (!product) return;

        const uploadedGallery = [];
        let thumbnail = null;

        for (let i = 0; i < externalUrls.length; i++) {
            const url = externalUrls[i];
            
            try {
                // Generate a unique hash for the URL to prevent duplicate uploads if re-run
                const urlHash = crypto.createHash('md5').update(url).digest('hex');
                const publicId = `oikyo_products/${productId}_${urlHash}`;

                // Fetch image as stream/buffer
                const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
                const buffer = Buffer.from(response.data, 'binary');

                // Upload to Cloudinary (Optimization handled by Cloudinary upload preset)
                const uploadResult = await this._uploadToCloudinary(buffer, publicId);

                if (i === 0) {
                    thumbnail = uploadResult.secure_url; // First image becomes thumbnail
                }
                uploadedGallery.push(uploadResult.secure_url);

            } catch (error) {
                console.error(`[Media Manager] Failed to process image ${url}:`, error.message);
                // Business Rule: Fallback placeholder can be set here if needed
            }
        }

        // Update Product with new Cloudinary URLs
        product.media.thumbnail = thumbnail || product.media.thumbnail;
        product.media.gallery = uploadedGallery.length > 0 ? uploadedGallery : product.media.gallery;
        
        // Recalculate Quality Score as media is now available
        product.editorState.qualityScore = productEditorService.calculateQualityScore(product.toObject());
        await product.save();

        // Log Activity
        await productEditorService.logActivity(
            productId, 
            'manual_edit_saved', // Using existing enum for system update
            null, 
            `Media Import Manager successfully processed ${uploadedGallery.length} images.`
        );
    }

    _uploadToCloudinary(buffer, publicId) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { 
                    public_id: publicId,
                    folder: 'oikyo_products',
                    format: 'webp', // Auto convert to webp
                    quality: 'auto'
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            uploadStream.end(buffer);
        });
    }
}

module.exports = new MediaImportManager();