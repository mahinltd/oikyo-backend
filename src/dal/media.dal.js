/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const MediaFolder = require('../models/mediaFolder.model');
const MediaItem = require('../models/mediaItem.model');

class MediaDal {
    // --- Folder Operations ---
    async createFolder(data) {
        return await MediaFolder.create(data);
    }
    
    async getAllFolders() {
        return await MediaFolder.find().sort({ name: 1 });
    }

    async deleteFolder(id) {
        return await MediaFolder.findByIdAndDelete(id);
    }

    // --- Media Item Operations ---
    async saveMediaItem(data) {
        return await MediaItem.create(data);
    }

    async getMediaItems(folderId = null, page = 1, limit = 20) {
        const query = folderId ? { folderId } : {};
        const skip = (page - 1) * limit;
        
        const items = await MediaItem.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
            
        const total = await MediaItem.countDocuments(query);
        
        return { items, total, page, totalPages: Math.ceil(total / limit) };
    }

    async getMediaById(id) {
        return await MediaItem.findById(id);
    }

    async deleteMediaItem(id) {
        return await MediaItem.findByIdAndDelete(id);
    }
}

module.exports = new MediaDal();