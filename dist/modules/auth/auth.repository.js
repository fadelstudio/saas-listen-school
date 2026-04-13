"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
exports.authRepository = {
    async findByEmail(email) {
        return prisma_1.prisma.user.findUnique({ where: { email } });
    },
    async findByIdentifier(identifier) {
        return prisma_1.prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { matricule: identifier }
                ]
            }
        });
    },
    async findById(id) {
        return prisma_1.prisma.user.findUnique({ where: { id } });
    },
    async create(data) {
        return prisma_1.prisma.user.create({
            data: {
                email: data.email,
                passwordHash: data.passwordHash,
                firstName: data.firstName,
                lastName: data.lastName,
                campusId: data.campusId,
                classId: data.classId,
            },
        });
    },
    async updatePassword(userId, passwordHash) {
        return prisma_1.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
    },
    async updateProfile(userId, data) {
        return prisma_1.prisma.user.update({
            where: { id: userId },
            data,
        });
    },
    // ─── Refresh Tokens ─────────────────────────────────────────────────────────
    async createRefreshToken(userId, token, expiresAt) {
        return prisma_1.prisma.refreshToken.create({
            data: {
                userId,
                token,
                expiresAt,
            },
        });
    },
    async findRefreshToken(token) {
        return prisma_1.prisma.refreshToken.findUnique({
            where: { token },
            include: { user: true },
        });
    },
    async deleteRefreshToken(token) {
        return prisma_1.prisma.refreshToken.delete({
            where: { token },
        });
    },
    async deleteAllUserRefreshTokens(userId) {
        return prisma_1.prisma.refreshToken.deleteMany({
            where: { userId },
        });
    },
    async setActive(userId, isActive) {
        return prisma_1.prisma.user.update({
            where: { id: userId },
            data: { isActive },
        });
    },
};
//# sourceMappingURL=auth.repository.js.map