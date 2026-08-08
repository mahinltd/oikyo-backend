/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mediaDal = require('../dal/media.dal');
const cloudinaryUtil = require('../utils/cloudinary.util');
const ApiError = require('../utils/ApiError');
const slugify = require('slugify'); // Requires: npm install slugify

class MediaService {
    
    // --- Folder Logic ---
    async createFolder(name, description) {
        const slug = slugify(name, { lower: true, strict: true });
        return await mediaDal.createFolder({ name, slug, description });
    }

    async getFolders() {
        return await mediaDal.getAllFolders();
    }

    // --- Media Upload Logic ---
    async uploadMedia(file, metadata) {
        if (!file) throw new ApiError(400, 'No file provided for upload');

        // Determine Cloudinary folder structure
        let cloudFolder = 'oikyo_media/general';
        if (metadata.folderId) {
            // Optional: Fetch folder name from DB to organize Cloudinary paths similarly
            cloudFolder = `oikyo_media/${metadata.folderId}`; 
        }

        const cloudResponse = await cloudinaryUtil.uploadFile(file.path, cloudFolder);
        
        if (!cloudResponse) {
            throw new ApiError(500, 'Failed to upload image to cloud server');
        }

        const mediaData = {
            title: metadata.title || file.originalname,
            altText: metadata.altText || '',
            url: cloudResponse.secure_url,
            publicId: cloudResponse.public_id,
            resourceType: cloudResponse.resource_type,
            format: cloudResponse.format,
            bytes: cloudResponse.bytes,
            folderId: metadata.folderId || null
        };

        return await mediaDal.saveMediaItem(mediaData);
    }

    async getLibrary(folderId, page, limit) {
        return await mediaDal.getMediaItems(folderId, page, limit);
    }

    async deleteMedia(id) {
        const media = await mediaDal.getMediaById(id);
        if (!media) throw new ApiError(404, 'Media not found');

        // 1. Delete from Cloudinary
        await cloudinaryUtil.deleteFile(media.publicId);
        
        // 2. Delete from Database
        await mediaDal.deleteMediaItem(id);
        
        return true;
    }
}

module.exports = new MediaService();