/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const MaintenanceSetting = require('../models/maintenance.model');

class MaintenanceDal {
    async getMaintenanceStatus() {
        return await MaintenanceSetting.findOne({ isGlobal: true }).lean();
    }

    async upsertMaintenanceStatus(data) {
        return await MaintenanceSetting.findOneAndUpdate(
            { isGlobal: true },
            { $set: data },
            { new: true, upsert: true, runValidators: true }
        );
    }
}

module.exports = new MaintenanceDal();