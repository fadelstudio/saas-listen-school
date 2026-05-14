"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.announcementsRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
exports.announcementsRepository = {
    async create(schoolId, data) {
        return prisma_1.prisma.announcement.create({
            data: {
                ...data,
                schoolId,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
        });
    },
    async findById(id, schoolId) {
        return prisma_1.prisma.announcement.findFirst({
            where: { id, schoolId },
        });
    },
    async findAll(schoolId) {
        return prisma_1.prisma.announcement.findMany({
            where: { schoolId },
            orderBy: { createdAt: 'desc' },
        });
    },
    async findActive(schoolId) {
        return prisma_1.prisma.announcement.findFirst({
            where: { schoolId, isActive: true },
            orderBy: { updatedAt: 'desc' },
        });
    },
    async update(id, schoolId, data) {
        return prisma_1.prisma.announcement.updateMany({
            where: { id, schoolId },
            data: {
                ...data,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
        });
    },
    async deactivateAll(schoolId) {
        return prisma_1.prisma.announcement.updateMany({
            where: { schoolId, isActive: true },
            data: { isActive: false },
        });
    },
    async delete(id, schoolId) {
        return prisma_1.prisma.announcement.deleteMany({
            where: { id, schoolId },
        });
    },
};
//# sourceMappingURL=announcements.repository.js.map