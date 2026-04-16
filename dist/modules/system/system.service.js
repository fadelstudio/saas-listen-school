"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemService = void 0;
const system_repository_1 = require("./system.repository");
const prisma_1 = require("../../core/database/prisma");
// In-memory cache per school
const settingsCache = new Map();
const CACHE_TTL = 30000; // 30 seconds
exports.systemService = {
    async getSettings(schoolId, forceRefresh = false) {
        const cached = settingsCache.get(schoolId);
        const now = Date.now();
        if (!cached || forceRefresh || (now - cached.timestamp > CACHE_TTL)) {
            const settings = await system_repository_1.systemRepository.getSettings(schoolId);
            if (!settings)
                throw new Error('Settings not found for this school');
            const response = settings;
            settingsCache.set(schoolId, { data: response, timestamp: now });
            return response;
        }
        return cached.data;
    },
    async updateSettings(schoolId, data) {
        const updated = await system_repository_1.systemRepository.updateSettings(schoolId, data);
        const response = updated;
        settingsCache.set(schoolId, { data: response, timestamp: Date.now() });
        return response;
    },
    async getSchoolSettingsByCampus(campusId) {
        return prisma_1.prisma.campus.findUnique({
            where: { id: campusId },
            select: { schoolId: true }
        });
    }
};
//# sourceMappingURL=system.service.js.map