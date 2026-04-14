"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saasService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../../core/database/prisma");
const AppError_1 = require("../../core/errors/AppError");
const AppError_2 = require("../../core/errors/AppError");
const client_1 = require("@prisma/client");
const SALT_ROUNDS = 12;
exports.saasService = {
    async createSchool(input) {
        // 1. Check if email or matricule exists
        const orConditions = [
            { email: input.adminEmail },
            ...(input.matricule ? [{ matricule: input.matricule }] : []),
        ];
        const existingUser = await prisma_1.prisma.user.findFirst({
            where: {
                OR: orConditions,
            }
        });
        if (existingUser) {
            throw new AppError_2.ConflictError('Admin with this email or matricule already exists');
        }
        // 2. Hash password
        const passwordHash = await bcrypt_1.default.hash(input.adminPassword, SALT_ROUNDS);
        // 3. Transaction to create Campus + Admin
        return prisma_1.prisma.$transaction(async (tx) => {
            const campus = await tx.campus.create({
                data: {
                    name: input.name,
                    location: input.location,
                }
            });
            const user = await tx.user.create({
                data: {
                    email: input.adminEmail,
                    passwordHash,
                    firstName: input.adminFirstName,
                    lastName: input.adminLastName,
                    role: client_1.Role.ADMIN,
                    campusId: campus.id,
                    matricule: input.matricule,
                    isActive: true
                }
            });
            return { campus, user: { id: user.id, email: user.email, role: user.role } };
        });
    },
    async listSchools() {
        return prisma_1.prisma.campus.findMany({
            include: {
                _count: {
                    select: {
                        users: true,
                        classes: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    },
    async getSchoolById(id) {
        const campus = await prisma_1.prisma.campus.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        users: true,
                        classes: true,
                        professors: true
                    }
                }
            }
        });
        if (!campus)
            throw new AppError_1.NotFoundError('School/Campus');
        return campus;
    },
    async updateSchool(id, data) {
        return prisma_1.prisma.campus.update({
            where: { id },
            data
        });
    }
};
//# sourceMappingURL=saas.service.js.map