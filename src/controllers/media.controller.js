/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mediaService = require('../services/media.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

class MediaController {
    
    createFolder = asyncHandler(async (req, res) => {
        const { name, description } = req.body;
        const folder = await mediaService.createFolder(name, description);
        return res.status(201).json(new ApiResponse(201, folder, "Folder created successfully."));
    });

    getFolders = asyncHandler(async (req, res) => {
        const folders = await mediaService.getFolders();
        return res.status(200).json(new ApiResponse(200, folders, "Folders fetched successfully."));
    });

    uploadMedia = asyncHandler(async (req, res) => {
        // req.file is populated by multer middleware in routes
        const media = await mediaService.uploadMedia(req.file, req.body);
        return res.status(201).json(new ApiResponse(201, media, "Media uploaded successfully."));
    });

    getMediaLibrary = asyncHandler(async (req, res) => {
        const { folderId, page, limit } = req.query;
        const library = await mediaService.getLibrary(folderId, Number(page) || 1, Number(limit) || 20);
        return res.status(200).json(new ApiResponse(200, library, "Media library fetched successfully."));
    });

    deleteMedia = asyncHandler(async (req, res) => {
        await mediaService.deleteMedia(req.params.id);
        return res.status(200).json(new ApiResponse(200, null, "Media deleted successfully."));
    });
}

module.exports = new MediaController();