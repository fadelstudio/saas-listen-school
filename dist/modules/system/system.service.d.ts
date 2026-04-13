import { UpdateSystemSettingsInput } from './system.schema';
import { SystemSettingsResponse } from './system.types';
export declare const systemService: {
    getSettings(forceRefresh?: boolean): Promise<SystemSettingsResponse>;
    updateSettings(data: UpdateSystemSettingsInput): Promise<SystemSettingsResponse>;
};
//# sourceMappingURL=system.service.d.ts.map