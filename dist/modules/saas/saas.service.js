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
function slugifySchoolName(name) {
    const base = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return base || 'school';
}
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
        // 3. Transaction to create School + Campus + Admin + Settings
        return prisma_1.prisma.$transaction(async (tx) => {
            const baseSlug = slugifySchoolName(input.name);
            let slug = baseSlug;
            let suffix = 2;
            while (await tx.school.findUnique({ where: { slug } })) {
                slug = `${baseSlug}-${suffix}`;
                suffix += 1;
            }
            const school = await tx.school.create({
                data: {
                    name: input.name,
                    slug,
                }
            });
            const campus = await tx.campus.create({
                data: {
                    schoolId: school.id,
                    name: `${input.name} - Main Campus`,
                    location: input.location,
                }
            });
            const starterLevels = ['L1', 'L2', 'L3'];
            for (let i = 0; i < starterLevels.length; i += 1) {
                await tx.academicLevel.create({
                    data: {
                        schoolId: school.id,
                        name: starterLevels[i],
                        order: i + 1,
                    },
                });
            }
            await tx.systemSettings.create({
                data: {
                    schoolId: school.id,
                    schoolName: input.name,
                    aiEnabled: true,
                    aiConfigs: [],
                }
            });
            const user = await tx.user.create({
                data: {
                    email: input.adminEmail,
                    passwordHash,
                    firstName: input.adminFirstName,
                    lastName: input.adminLastName,
                    role: client_1.Role.ADMIN,
                    schoolId: school.id,
                    matricule: input.matricule,
                    isActive: true,
                    emailVerified: true,
                    emailVerifiedAt: new Date(),
                },
            });
            return {
                school,
                campus,
                user: { id: user.id, email: user.email, role: user.role },
                loginHint: `Use header x-school-slug: ${school.slug} on POST /api/auth/login (and all API calls).`,
            };
        });
    },
    async listSchools() {
        return prisma_1.prisma.school.findMany({
            include: {
                campuses: true,
                _count: {
                    select: {
                        users: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    },
    async getSchoolById(id) {
        const school = await prisma_1.prisma.school.findUnique({
            where: { id },
            include: {
                campuses: {
                    include: {
                        _count: {
                            select: {
                                users: true,
                                classes: true
                            }
                        }
                    }
                },
                settings: true
            }
        });
        if (!school)
            throw new AppError_1.NotFoundError('School');
        return school;
    },
    async updateSchool(id, data) {
        return prisma_1.prisma.school.update({
            where: { id },
            data
        });
    },
    async createCampus(schoolId, data) {
        await this.getSchoolById(schoolId);
        return prisma_1.prisma.campus.create({
            data: {
                schoolId,
                name: data.name,
                location: data.location
            }
        });
    }
};
//# sourceMappingURL=saas.service.js.map