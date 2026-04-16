import type { UpdateSystemSettingsInput } from './system.schema';
export declare const systemRepository: {
    getSettings(schoolId: string): Promise<{
        id: string;
        updatedAt: Date;
        schoolId: string;
        schoolName: string;
        authReportsRequired: boolean;
        authEvaluationsRequired: boolean;
        authOtpRequired: boolean;
        aiEnabled: boolean;
        aiConfigs: import("@prisma/client/runtime/client").JsonValue;
        aiOverrideConfigId: string | null;
    } | null>;
    updateSettings(schoolId: string, data: UpdateSystemSettingsInput): Promise<{
        id: string;
        updatedAt: Date;
        schoolId: string;
        schoolName: string;
        authReportsRequired: boolean;
        authEvaluationsRequired: boolean;
        authOtpRequired: boolean;
        aiEnabled: boolean;
        aiConfigs: import("@prisma/client/runtime/client").JsonValue;
        aiOverrideConfigId: string | null;
    }>;
};
//# sourceMappingURL=system.repository.d.ts.map