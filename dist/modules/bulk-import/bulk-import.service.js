"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkImportService = void 0;
const prisma_1 = require("../../core/database/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const SALT_ROUNDS = 12;
exports.bulkImportService = {
    async importStudents(schoolId, campusId, csvData) {
        const lines = csvData.split('\n').filter(l => l.trim() !== '');
        const results = { success: 0, errors: [] };
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const email = values[0]?.trim();
            const firstName = values[1]?.trim();
            const lastName = values[2]?.trim();
            const matricule = values[3]?.trim();
            const classId = values[4]?.trim();
            if (!email || !firstName || !lastName || !classId) {
                results.errors.push(`Line ${i + 1}: Missing required fields (email, firstName, lastName, classId)`);
                continue;
            }
            try {
                const passwordHash = await bcrypt_1.default.hash('Afi12345!', SALT_ROUNDS);
                await prisma_1.prisma.user.create({
                    data: {
                        email,
                        firstName,
                        lastName,
                        matricule,
                        role: client_1.Role.STUDENT,
                        schoolId,
                        campusId,
                        classId,
                        passwordHash,
                        emailVerified: true,
                    }
                });
                results.success++;
            }
            catch (e) {
                results.errors.push(`Line ${i + 1}: ${e.message}`);
            }
        }
        return results;
    },
    async importProfessors(_schoolId, campusId, csvData) {
        const lines = csvData.split('\n').filter(l => l.trim() !== '');
        const results = { success: 0, errors: [] };
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const email = values[0]?.trim();
            const firstName = values[1]?.trim();
            const lastName = values[2]?.trim();
            if (!email || !firstName || !lastName) {
                results.errors.push(`Line ${i + 1}: Missing required fields (email, firstName, lastName)`);
                continue;
            }
            try {
                await prisma_1.prisma.professor.create({
                    data: {
                        email,
                        firstName,
                        lastName,
                        campusId,
                    }
                });
                results.success++;
            }
            catch (e) {
                results.errors.push(`Line ${i + 1}: ${e.message}`);
            }
        }
        return results;
    }
};
//# sourceMappingURL=bulk-import.service.js.map