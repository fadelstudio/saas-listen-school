"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
exports.systemRepository = {
    async getSettings() {
        // There is only one row of settings for now (the default-settings created in seed)
        return prisma_1.prisma.systemSettings.findFirst({
            where: { id: 'default-settings' }
        });
    },
    async updateSettings(data) {
        return prisma_1.prisma.systemSettings.update({
            where: { id: 'default-settings' },
            data
        });
    }
};
//# sourceMappingURL=system.repository.js.map