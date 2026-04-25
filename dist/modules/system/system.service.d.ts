import { UpdateSystemSettingsInput } from './system.schema';
import { SystemSettingsResponse } from './system.types';
export declare const systemService: {
    /**
     * Toggles publics pour l’école résolue par le middleware (req.schoolId).
     * Ne renvoie jamais de valeurs « génériques » d’une autre école : le nom vient de `School` si pas de ligne system_settings.
     */
    getPublicSettings(schoolId: string): Promise<{
        schoolSlug: string;
        schoolName: string;
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
};
//# sourceMappingURL=system.service.d.ts.map