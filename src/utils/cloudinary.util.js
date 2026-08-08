/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

class CloudinaryUtil {
    async uploadFile(localFilePath, folderName = 'oikyo_media') {
        try {
            if (!localFilePath) return null;
            // Upload the file to Cloudinary
            const response = await cloudinary.uploader.upload(localFilePath, {
                folder: folderName,
                resource_type: "auto"
            });
            // Delete local temp file after successful upload
            fs.unlinkSync(localFilePath);
            return response;
        } catch (error) {
            fs.unlinkSync(localFilePath); // Ensure local file is deleted on error
            throw error;
        }
    }

    async deleteFile(publicId) {
        try {
            await cloudinary.uploader.destroy(publicId);
            return true;
        } catch (error) {
            return false;
        }
    }
}

module.exports = new CloudinaryUtil();