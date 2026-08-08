/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Page = require('../models/page.model');
const PageVersion = require('../models/pageVersion.model');

class CmsDal {
    async createPage(data) {
        return await Page.create(data);
    }

    async getPublicPageBySlug(slug) {
        return await Page.findOne({ slug, status: 'published' }).lean();
    }

    async getAllPagesForAdmin() {
        return await Page.find().sort({ createdAt: -1 });
    }

    async getPageById(id) {
        return await Page.findById(id);
    }

    async updatePage(id, data) {
        return await Page.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    async deletePage(id) {
        return await Page.findByIdAndDelete(id);
    }

    // --- Versioning Operations ---
    async savePageVersion(pageData, note) {
        return await PageVersion.create({
            pageId: pageData._id,
            title: pageData.title,
            content: pageData.content,
            versionNote: note
        });
    }

    async getPageVersions(pageId) {
        return await PageVersion.find({ pageId }).sort({ savedAt: -1 });
    }

    async getPageVersionById(versionId) {
        return await PageVersion.findById(versionId);
    }
}

module.exports = new CmsDal();