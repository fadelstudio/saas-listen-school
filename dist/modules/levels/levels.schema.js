"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.levelParamsSchema = exports.updateLevelSchema = exports.createLevelSchema = void 0;
const zod_1 = require("zod");
exports.createLevelSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    order: zod_1.z.number().int().optional(),
});
exports.updateLevelSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    order: zod_1.z.number().int().optional(),
});
exports.levelParamsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
//# sourceMappingURL=levels.schema.js.map