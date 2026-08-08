/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const maintenanceDal = require('../dal/maintenance.dal');
const ApiError = require('../utils/ApiError');

class MaintenanceService {
    
    // Checked globally by Frontend or Backend Middleware
    async getStatus() {
        let status = await maintenanceDal.getMaintenanceStatus();
        
        // If not configured yet, assume the site is Live (Active: false)
        if (!status) {
            status = {
                isActive: false,
                message: 'System is running normally.',
                expectedLiveTime: null,
                bypassToken: null
            };
        }

        // Auto-disable maintenance if expectedLiveTime has passed
        if (status.isActive && status.expectedLiveTime) {
            const now = new Date();
            if (new Date(status.expectedLiveTime) <= now) {
                // Time has passed, auto-turn off maintenance mode
                status = await maintenanceDal.upsertMaintenanceStatus({ isActive: false });
            }
        }

        return status;
    }

    async updateStatus(data) {
        try {
            return await maintenanceDal.upsertMaintenanceStatus(data);
        } catch (error) {
            throw new ApiError(500, 'Failed to update maintenance settings');
        }
    }
}

module.exports = new MaintenanceService();