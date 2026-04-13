import type { UpdateSystemSettingsInput } from './system.schema';
export declare const systemRepository: {
    getSettings(): Promise<{
        id: string;
        updatedAt: Date;
        schoolName: string;
        authReportsRequired: boolean;
        authEvaluationsRequired: boolean;
        aiEnabled: boolean;
        aiConfigs: import("@prisma/client/runtime/client").JsonValue;
        aiOverrideConfigId: string | null;
    } | null>;
    updateSettings(data: UpdateSystemSettingsInput): Promise<{
        id: string;
        updatedAt: Date;
        schoolName: string;
        authReportsRequired: boolean;
        authEvaluationsRequired: boolean;
        aiEnabled: boolean;
        aiConfigs: import("@prisma/client/runtime/client").JsonValue;
        aiOverrideConfigId: string | null;
    }>;
};
//# sourceMappingURL=system.repository.d.ts.map