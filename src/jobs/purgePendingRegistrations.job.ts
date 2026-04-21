import { Role } from "@prisma/client";
import { prisma } from "../core/database/prisma";
import { env } from "../core/config/env";

/**
 * Supprime les comptes élèves créés via inscription + OTP mais jamais finalisés
 * (emailVerified=false au-delà de PENDING_REGISTRATION_TTL_MINUTES), ou désactivés
 * après trop de tentatives OTP, sans session refresh.
 */
export async function purgeStaleUnverifiedRegistrations(): Promise<number> {
  const ttlMs = env.PENDING_REGISTRATION_TTL_MINUTES * 60 * 1000;
  const cutoff = new Date(Date.now() - ttlMs);

  const result = await prisma.user.deleteMany({
    where: {
      emailVerified: false,
      role: Role.STUDENT,
      createdAt: { lt: cutoff },
      refreshTokens: { none: {} },
      OR: [{ loginOtpChallenges: { some: {} } }, { isActive: false }],
    },
  });

  return result.count;
}
