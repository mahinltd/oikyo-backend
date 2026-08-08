/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const coAssistantService = require('../../services/coAssistant/coAssistant.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

class CoAssistantController {
    
    askQuestion = asyncHandler(async (req, res) => {
        const { message, chatHistory } = req.body;
        
        const response = await coAssistantService.handleCustomerQuery(message, chatHistory);
        
        if (!response.success) {
            return res.status(503).json(new ApiResponse(503, response, "Assistant is currently unavailable"));
        }

        res.status(200).json(new ApiResponse(200, response, "Assistant replied successfully"));
    });
}

module.exports = new CoAssistantController();