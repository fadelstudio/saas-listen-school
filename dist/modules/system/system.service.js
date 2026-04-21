"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemService = void 0;
const system_repository_1 = require("./system.repository");
const prisma_1 = require("../../core/database/prisma");
const AppError_1 = require("../../core/errors/AppError");
// In-memory cache per school
const settingsCache = new Map();
const CACHE_TTL = 30000; // 30 seconds
exports.systemService = {
    /**
     * Toggles publics pour l’école résolue par le middleware (req.schoolId).
     * Ne renvoie jamais de valeurs « génériques » d’une autre école : le nom vient de `School` si pas de ligne system_settings.
     */
    async getPublicSettings(schoolId) {
        const school = await prisma_1.prisma.school.findUnique({
            where: { id: schoolId },
            select: { name: true, slug: true },
        });
        if (!school) {
            throw new AppError_1.NotFoundError('School');
        }
        const settings = await prisma_1.prisma.systemSettings.findUnique({
            where: { schoolId },
            select: {
                schoolName: true,
                aiEnabled: true,
                authOtpRequired: true,
                authReportsRequired: true,
                authEvaluationsRequired: true,
                updatedAt: true,
            },
        });
        const base = {
            schoolSlug: school.slug,
            schoolName: settings?.schoolName ?? school.name,
            aiEnabled: settings?.aiEnabled ?? true,
            authOtpRequired: settings?.authOtpRequired ?? false,
            authReportsRequired: settings?.authReportsRequired ?? false,
            authEvaluationsRequired: settings?.authEvaluationsRequired ?? false,
            updatedAt: settings?.updatedAt ?? new Date(0),
        };
        return base;
    },
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
};
//# sourceMappingURL=system.service.js.map