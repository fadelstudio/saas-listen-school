import type { UpdateSystemSettingsInput } from './system.schema';
import { Prisma } from '@prisma/client';
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
        aiConfigs: Prisma.JsonValue;
        aiOverrideConfigId: string | null;
    } | null>;
    updateSettings(schoolId: string, data: UpdateSystemSettingsInput): Promise<any>;
};
//# sourceMappingURL=system.repository.d.ts.map