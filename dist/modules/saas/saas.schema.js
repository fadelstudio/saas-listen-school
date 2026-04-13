"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSchoolSchema = void 0;
const zod_1 = require("zod");
exports.createSchoolSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Le nom de l\'école est requis'),
    location: zod_1.z.string().optional(),
    adminEmail: zod_1.z.string().email('Email admin invalide'),
    adminPassword: zod_1.z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères'),
    adminFirstName: zod_1.z.string().min(1, 'Prénom obligatoire'),
    adminLastName: zod_1.z.string().min(1, 'Nom obligatoire'),
    matricule: zod_1.z.string().optional(),
});
//# sourceMappingURL=saas.schema.js.map