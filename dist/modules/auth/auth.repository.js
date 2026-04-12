"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
exports.authRepository = {
    async findByEmail(email) {
        return prisma_1.prisma.user.findUnique({ where: { email } });
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
    async setActive(userId, isActive) {
        return prisma_1.prisma.user.update({
            where: { id: userId },
            data: { isActive },
        });
    },
};
//# sourceMappingURL=auth.repository.js.map