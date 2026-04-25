"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
const client_1 = require("@prisma/client");
exports.systemRepository = {
    async getSettings(schoolId) {
        try {
            return await prisma_1.prisma.systemSettings.findUnique({
                where: { schoolId },
                include: { school: { select: { logoUrl: true } } }
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2022') {
                return prisma_1.prisma.systemSettings.findFirst({
                    include: { school: { select: { logoUrl: true } } }
                });
            }
            throw error;
        }
    },
    async updateSettings(schoolId, data) {
        try {
            return await prisma_1.prisma.systemSettings.update({
                where: { schoolId },
                data
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2022') {
                const first = await prisma_1.prisma.systemSettings.findFirst({ select: { id: true } });
                if (!first) {
                    throw error;
                }
                return prisma_1.prisma.systemSettings.update({
                    where: { id: first.id },
                    data,
                });
            }
            throw error;
        }
    }
};
//# sourceMappingURL=system.repository.js.map