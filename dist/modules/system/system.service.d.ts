import { UpdateSystemSettingsInput } from './system.schema';
import { SystemSettingsResponse } from './system.types';
export declare const systemService: {
    getSettings(schoolId: string, forceRefresh?: boolean): Promise<SystemSettingsResponse>;
    updateSettings(schoolId: string, data: UpdateSystemSettingsInput): Promise<SystemSettingsResponse>;
    getSchoolSettingsByCampus(campusId: string): Promise<{
        schoolId: string;
    } | null>;
};
//# sourceMappingURL=system.service.d.ts.map