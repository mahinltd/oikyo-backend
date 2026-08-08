/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const cmsDal = require('../dal/cms.dal');
const ApiError = require('../utils/ApiError');
const slugify = require('slugify');

class CmsService {
    
    async createNewPage(data) {
        // Ensure slug is properly formatted
        data.slug = slugify(data.slug, { lower: true, strict: true });
        
        const existingPage = await cmsDal.getPublicPageBySlug(data.slug);
        if (existingPage) {
            throw new ApiError(400, 'A page with this URL slug already exists.');
        }

        return await cmsDal.createPage(data);
    }

    async getPageBySlug(slug) {
        const page = await cmsDal.getPublicPageBySlug(slug);
        if (!page) throw new ApiError(404, 'Page not found');
        return page;
    }

    async getAllPages() {
        return await cmsDal.getAllPagesForAdmin();
    }

    async updatePage(id, updateData) {
        if (updateData.slug) {
            updateData.slug = slugify(updateData.slug, { lower: true, strict: true });
        }

        const currentPage = await cmsDal.getPageById(id);
        if (!currentPage) throw new ApiError(404, 'Page not found');

        // Enterprise Feature: Save current state to Version History before updating
        await cmsDal.savePageVersion(currentPage, 'Auto-saved before modification');

        return await cmsDal.updatePage(id, updateData);
    }

    async deletePage(id) {
        const deleted = await cmsDal.deletePage(id);
        if (!deleted) throw new ApiError(404, 'Page not found');
        return true;
    }

    // --- Restore & Versioning Logic ---
    async getVersions(pageId) {
        return await cmsDal.getPageVersions(pageId);
    }

    async restoreVersion(pageId, versionId) {
        const version = await cmsDal.getPageVersionById(versionId);
        if (!version) throw new ApiError(404, 'Version not found');

        const currentPage = await cmsDal.getPageById(pageId);
        if (!currentPage) throw new ApiError(404, 'Page not found');

        // Save current state before restoring an old version
        await cmsDal.savePageVersion(currentPage, 'Auto-saved before restoring an older version');

        // Apply restored data
        const restoreData = {
            title: version.title,
            content: version.content
        };

        return await cmsDal.updatePage(pageId, restoreData);
    }
}

module.exports = new CmsService();