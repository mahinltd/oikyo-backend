/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const aiProviderDal = require('../../dal/ai/aiProvider.dal');
const aiRegistry = require('../../services/ai/aiProviderRegistry.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

class AiProviderController {
    
    createProvider = asyncHandler(async (req, res) => {
        const provider = await aiProviderDal.createProvider(req.body);
        await aiRegistry.invalidateCache(); // Sync system state
        res.status(201).json(new ApiResponse(201, provider, "AI Provider created successfully"));
    });

    getAllProviders = asyncHandler(async (req, res) => {
        const providers = await aiProviderDal.getProvidersForAdmin();
        res.status(200).json(new ApiResponse(200, providers, "AI Providers fetched successfully"));
    });

    updateProvider = asyncHandler(async (req, res) => {
        const provider = await aiProviderDal.updateProvider(req.params.id, req.body);
        await aiRegistry.invalidateCache(); // Sync system state
        res.status(200).json(new ApiResponse(200, provider, "AI Provider updated successfully"));
    });
}

module.exports = new AiProviderController();