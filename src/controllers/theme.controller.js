/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const themeService = require('../services/theme.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

class ThemeController {
    
    getActiveTheme = asyncHandler(async (req, res) => {
        const theme = await themeService.getActiveTheme();
        return res.status(200).json(
            new ApiResponse(200, theme, "Active theme fetched successfully.")
        );
    });

    getAllThemes = asyncHandler(async (req, res) => {
        const themes = await themeService.getAllThemes();
        return res.status(200).json(
            new ApiResponse(200, themes, "All themes fetched successfully.")
        );
    });

    createTheme = asyncHandler(async (req, res) => {
        const newTheme = await themeService.createNewTheme(req.body);
        return res.status(201).json(
            new ApiResponse(201, newTheme, "New theme draft created successfully.")
        );
    });

    updateTheme = asyncHandler(async (req, res) => {
        const updatedTheme = await themeService.updateThemeData(req.params.id, req.body);
        return res.status(200).json(
            new ApiResponse(200, updatedTheme, "Theme updated successfully.")
        );
    });

    activateTheme = asyncHandler(async (req, res) => {
        const { themeId } = req.body;
        const activatedTheme = await themeService.activateTheme(themeId);
        return res.status(200).json(
            new ApiResponse(200, activatedTheme, `Theme '${activatedTheme.themeName}' is now active.`)
        );
    });
}

module.exports = new ThemeController();