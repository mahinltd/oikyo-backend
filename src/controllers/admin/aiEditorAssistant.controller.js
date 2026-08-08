/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const aiEditorAssistantService = require('../../services/ai/aiEditorAssistant.service');
const ApiError = require('../../utils/ApiError');

class AiEditorAssistantController {

    // Execute an AI productivity task inside the editor
    async executeEditorTask(req, res, next) {
        try {
            const { taskType, productContext } = req.body;
            
            // Expected productContext: { title: "...", description: "...", categoryName: "..." }
            if (!taskType || !productContext) {
                throw new ApiError(400, 'taskType and productContext are required.');
            }

            const aiResponse = await aiEditorAssistantService.executeTask(taskType, productContext);

            res.status(200).json({
                success: true,
                message: 'AI Task executed successfully.',
                data: aiResponse // Will be JSON object or string based on template config
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AiEditorAssistantController();