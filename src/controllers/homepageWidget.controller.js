/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const widgetService = require('../services/homepageWidget.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

class HomepageWidgetController {
    
    getPublicLayout = asyncHandler(async (req, res) => {
        const layout = await widgetService.getPublicLayout();
        return res.status(200).json(new ApiResponse(200, layout, "Public homepage layout fetched successfully."));
    });

    getAdminLayout = asyncHandler(async (req, res) => {
        const layout = await widgetService.getAdminLayout();
        return res.status(200).json(new ApiResponse(200, layout, "Admin homepage layout fetched successfully."));
    });

    createWidget = asyncHandler(async (req, res) => {
        const widget = await widgetService.addWidget(req.body);
        return res.status(201).json(new ApiResponse(201, widget, "New homepage widget created."));
    });

    updateWidget = asyncHandler(async (req, res) => {
        const widget = await widgetService.updateWidget(req.params.id, req.body);
        return res.status(200).json(new ApiResponse(200, widget, "Widget updated successfully."));
    });

    deleteWidget = asyncHandler(async (req, res) => {
        await widgetService.removeWidget(req.params.id);
        return res.status(200).json(new ApiResponse(200, null, "Widget removed from layout."));
    });

    reorderWidgets = asyncHandler(async (req, res) => {
        const result = await widgetService.reorderWidgets(req.body.widgets);
        return res.status(200).json(new ApiResponse(200, null, result.message));
    });
}

module.exports = new HomepageWidgetController();