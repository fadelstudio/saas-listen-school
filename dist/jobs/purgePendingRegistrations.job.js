"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purgeStaleUnverifiedRegistrations = purgeStaleUnverifiedRegistrations;
const client_1 = require("@prisma/client");
const prisma_1 = require("../core/database/prisma");
const env_1 = require("../core/config/env");
/**
 * Supprime les comptes élèves créés via inscription + OTP mais jamais finalisés
 * (emailVerified=false au-delà de PENDING_REGISTRATION_TTL_MINUTES), ou désactivés
 * après trop de tentatives OTP, sans session refresh.
 */
async function purgeStaleUnverifiedRegistrations() {
    const ttlMs = env_1.env.PENDING_REGISTRATION_TTL_MINUTES * 60 * 1000;
    const cutoff = new Date(Date.now() - ttlMs);
    const result = await prisma_1.prisma.user.deleteMany({
        where: {
            emailVerified: false,
            role: client_1.Role.STUDENT,
            createdAt: { lt: cutoff },
            refreshTokens: { none: {} },
            OR: [{ loginOtpChallenges: { some: {} } }, { isActive: false }],
        },
    });
    return result.count;
}
//# sourceMappingURL=purgePendingRegistrations.job.js.map