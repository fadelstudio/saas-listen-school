"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemService = void 0;
/// <reference types="multer" />
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
            const response = { ...settings, logoUrl: settings.school?.logoUrl };
            delete response.school;
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
    async getAvailableModels() {
        const { FALLBACK_TOP5 } = await Promise.resolve().then(() => __importStar(require('../../core/ai/ModelDiscovery')));
        return Object.entries(FALLBACK_TOP5).map(([provider, models]) => ({
            provider,
            models: models.map(m => ({ value: m.id, label: m.name }))
        }));
    },
    async updateLogo(schoolId, file) {
        const { uploadsService } = await Promise.resolve().then(() => __importStar(require('../uploads/uploads.service')));
        // Attempt multiple common bucket names
        const buckets = ['schools', 'logos', 'attachments', 'public', 'general', 'files'];
        let result;
        let lastError;
        for (const bucket of buckets) {
            try {
                result = await uploadsService.uploadFile(file, `logos/${schoolId}`, bucket);
                if (result)
                    break;
            }
            catch (e) {
                lastError = e;
                console.warn(`⚠️ Bucket '${bucket}' not found or error, trying next...`);
            }
        }
        if (!result) {
            throw lastError || new Error('All storage buckets failed. Please check Supabase configuration.');
        }
        await prisma_1.prisma.school.update({
            where: { id: schoolId },
            data: { logoUrl: result.url }
        });
        settingsCache.delete(schoolId);
        return { url: result.url };
    }
};
//# sourceMappingURL=system.service.js.map