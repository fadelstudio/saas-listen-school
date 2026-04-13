"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSystemSettingsSchema = void 0;
const zod_1 = require("zod");
exports.updateSystemSettingsSchema = zod_1.z.object({
    schoolName: zod_1.z.string().min(1).optional(),
    authReportsRequired: zod_1.z.boolean().optional(),
    authEvaluationsRequired: zod_1.z.boolean().optional(),
    aiEnabled: zod_1.z.boolean().optional(),
    aiConfigs: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        provider: zod_1.z.string(),
        model: zod_1.z.string(),
        apiKey: zod_1.z.string(),
        priority: zod_1.z.number(),
        isFree: zod_1.z.boolean().optional(),
    })).optional(),
    aiOverrideConfigId: zod_1.z.string().optional().nullable(),
});
//# sourceMappingURL=system.schema.js.map