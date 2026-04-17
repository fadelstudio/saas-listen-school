"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
const client_1 = require("@prisma/client");
exports.systemRepository = {
    async getSettings(schoolId) {
        try {
            return await prisma_1.prisma.systemSettings.findUnique({
                where: { schoolId }
            });
        }
        catch (error) {
            // Legacy single-school databases may not have system_settings.schoolId yet.
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2022') {
                return prisma_1.prisma.systemSettings.findFirst();
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
            // Legacy single-school fallback: patch the first settings row.
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2022') {
                const existing = await prisma_1.prisma.systemSettings.findFirst({
                    select: { id: true },
                });
                if (!existing) {
                    return prisma_1.prisma.systemSettings.create({
                        data: {
                            schoolName: data.schoolName ?? 'AFI',
                            authReportsRequired: data.authReportsRequired ?? false,
                            authEvaluationsRequired: data.authEvaluationsRequired ?? false,
                            aiEnabled: data.aiEnabled ?? true,
                            aiConfigs: data.aiConfigs ?? [],
                            aiOverrideConfigId: data.aiOverrideConfigId ?? null,
                        },
                    });
                }
                return prisma_1.prisma.systemSettings.update({
                    where: { id: existing.id },
                    data,
                });
            }
            throw error;
        }
    }
};
//# sourceMappingURL=system.repository.js.map