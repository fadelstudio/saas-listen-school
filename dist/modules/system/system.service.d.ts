import { UpdateSystemSettingsInput } from './system.schema';
import { SystemSettingsResponse } from './system.types';
export declare const systemService: {
    /**
     * Toggles publics pour l’école résolue par le middleware (req.schoolId).
     * Utilise le cache interne pour garantir une mise à jour instantanée après modif admin.
     */
    getPublicSettings(schoolId: string): Promise<{
        schoolSlug: string;
        schoolName: string;
        logoUrl: string | null;
        aiEnabled: boolean;
        authOtpRequired: boolean;
        authReportsRequired: boolean;
        authEvaluationsRequired: boolean;
        updatedAt: Date;
    }>;
    getSettings(schoolId: string, forceRefresh?: boolean): Promise<SystemSettingsResponse>;
    updateSettings(schoolId: string, data: UpdateSystemSettingsInput): Promise<SystemSettingsResponse>;
    getAvailableModels(): Promise<{
        provider: string;
        models: {
            value: string;
            label: string;
        }[];
    }[]>;
    updateLogo(schoolId: string, file: Express.Multer.File): Promise<{
        url: string;
    }>;
    /**
     * Récupère les données nécessaires pour remplir les formulaires (Signalements, Évaluations)
     * sans authentification. Utile pour le mode invité du mobile.
     */
    getPublicFormData(schoolId: string): Promise<{
        campuses: {
            name: string;
            id: string;
        }[];
        classes: {
            name: string;
            id: string;
            campusId: string;
        }[];
        professors: {
            id: string;
            name: string;
            targetClassIds: string[];
            targetModuleIds: string[];
        }[];
        modules: {
            id: string;
            name: string;
            targetClassIds: string[];
        }[];
        types: string[];
        priorities: string[];
    }>;
};
//# sourceMappingURL=system.service.d.ts.map