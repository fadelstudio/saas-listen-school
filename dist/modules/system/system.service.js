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
     * Utilise le cache interne pour garantir une mise à jour instantanée après modif admin.
     */
    async getPublicSettings(schoolId) {
        // On récupère les settings via la fonction qui gère le cache
        const settings = await this.getSettings(schoolId);
        // On récupère les infos de l'école (slug, logo)
        const school = await prisma_1.prisma.school.findUnique({
            where: { id: schoolId },
            select: { name: true, slug: true, logoUrl: true },
        });
        if (!school)
            throw new AppError_1.NotFoundError('School');
        let finalLogoUrl = school.logoUrl;
        if (finalLogoUrl && finalLogoUrl.includes('/object/sign/')) {
            try {
                const urlObj = new URL(finalLogoUrl);
                urlObj.pathname = urlObj.pathname.replace('/object/sign/', '/object/public/');
                urlObj.search = '';
                finalLogoUrl = urlObj.toString();
            }
            catch (e) {
                // Ignore invalid URLs
            }
        }
        return {
            schoolSlug: school.slug,
            schoolName: settings.schoolName || school.name,
            logoUrl: finalLogoUrl,
            aiEnabled: settings.aiEnabled,
            authOtpRequired: settings.authOtpRequired,
            authReportsRequired: settings.authReportsRequired,
            authEvaluationsRequired: settings.authEvaluationsRequired,
            updatedAt: settings.updatedAt,
        };
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
        let finalUrl = result.url;
        if (finalUrl && finalUrl.includes('/object/sign/')) {
            try {
                const urlObj = new URL(finalUrl);
                urlObj.pathname = urlObj.pathname.replace('/object/sign/', '/object/public/');
                urlObj.search = '';
                finalUrl = urlObj.toString();
            }
            catch (e) {
                // Fallback
            }
        }
        await prisma_1.prisma.school.update({
            where: { id: schoolId },
            data: { logoUrl: finalUrl }
        });
        settingsCache.delete(schoolId);
        return { url: finalUrl };
    },
    /**
     * Récupère les données nécessaires pour remplir les formulaires (Signalements, Évaluations)
     * sans authentification. Utile pour le mode invité du mobile.
     */
    async getPublicFormData(schoolId) {
        const [campuses, professors, types, priorities, modules] = await Promise.all([
            prisma_1.prisma.campus.findMany({
                where: { schoolId },
                select: { id: true, name: true },
            }),
            prisma_1.prisma.professor.findMany({
                where: { schoolId },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    modules: {
                        select: { classId: true, moduleId: true }
                    }
                },
            }),
            // Enums ReportType et Priority
            Promise.resolve(['PROBLEM_MATERIAL', 'PROBLEM_ADMIN', 'PROBLEM_PEDAGOGICAL', 'INCIDENT', 'SUGGESTION', 'OTHER']),
            Promise.resolve(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
            prisma_1.prisma.module.findMany({
                where: { schoolId },
                select: {
                    id: true,
                    name: true,
                    classModules: {
                        select: { classId: true }
                    }
                },
            })
        ]);
        // On récupère aussi les classes liées aux campus
        const classes = await prisma_1.prisma.class.findMany({
            where: { campus: { schoolId } },
            select: { id: true, name: true, campusId: true },
        });
        return {
            campuses,
            classes,
            professors: professors.map(p => ({
                id: p.id,
                name: `${p.firstName} ${p.lastName}`,
                targetClassIds: Array.from(new Set(p.modules.map(m => m.classId))),
                targetModuleIds: Array.from(new Set(p.modules.map(m => m.moduleId)))
            })),
            modules: modules.map(m => ({
                id: m.id,
                name: m.name,
                targetClassIds: m.classModules.map(cm => cm.classId)
            })),
            types,
            priorities,
        };
    }
};
//# sourceMappingURL=system.service.js.map