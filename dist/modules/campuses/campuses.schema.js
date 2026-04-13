"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campusParamsSchema = exports.updateCampusSchema = exports.createCampusSchema = void 0;
const zod_1 = require("zod");
exports.createCampusSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    location: zod_1.z.string().max(200).optional(),
});
exports.updateCampusSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    location: zod_1.z.string().max(200).optional(),
});
exports.campusParamsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
//# sourceMappingURL=campuses.schema.js.map