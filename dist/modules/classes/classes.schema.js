"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classQuerySchema = exports.classParamsSchema = exports.updateClassSchema = exports.createClassSchema = void 0;
const zod_1 = require("zod");
exports.createClassSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    levelId: zod_1.z.string().uuid(),
    campusId: zod_1.z.string().uuid(),
});
exports.updateClassSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    levelId: zod_1.z.string().uuid().optional(),
    campusId: zod_1.z.string().uuid().optional(),
});
exports.classParamsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
exports.classQuerySchema = zod_1.z.object({
    campusId: zod_1.z.string().uuid().optional(),
    levelId: zod_1.z.string().uuid().optional(),
    search: zod_1.z.string().optional(),
});
//# sourceMappingURL=classes.schema.js.map