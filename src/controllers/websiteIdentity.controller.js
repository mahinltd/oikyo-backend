/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const websiteIdentityService = require('../services/websiteIdentity.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

class WebsiteIdentityController {
    
    getIdentity = asyncHandler(async (req, res) => {
        const identity = await websiteIdentityService.getWebsiteIdentity();
        return res.status(200).json(
            new ApiResponse(200, identity, "Website identity fetched successfully.")
        );
    });

    updateIdentity = asyncHandler(async (req, res) => {
        const updatedIdentity = await websiteIdentityService.updateWebsiteIdentity(req.body);
        return res.status(200).json(
            new ApiResponse(200, updatedIdentity, "Website identity updated successfully.")
        );
    });
}

module.exports = new WebsiteIdentityController();