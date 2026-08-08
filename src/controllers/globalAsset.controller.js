/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const globalAssetService = require('../services/globalAsset.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

class GlobalAssetController {
    
    getAssets = asyncHandler(async (req, res) => {
        const assets = await globalAssetService.getGlobalAssets();
        return res.status(200).json(
            new ApiResponse(200, assets, "Global assets fetched successfully.")
        );
    });

    updateAssets = asyncHandler(async (req, res) => {
        const updatedAssets = await globalAssetService.updateGlobalAssets(req.body);
        return res.status(200).json(
            new ApiResponse(200, updatedAssets, "Global assets updated successfully.")
        );
    });
}

module.exports = new GlobalAssetController();