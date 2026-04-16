"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
exports.systemRepository = {
    async getSettings(schoolId) {
        return prisma_1.prisma.systemSettings.findUnique({
            where: { schoolId }
        });
    },
    async updateSettings(schoolId, data) {
        return prisma_1.prisma.systemSettings.update({
            where: { schoolId },
            data
        });
    }
};
//# sourceMappingURL=system.repository.js.map