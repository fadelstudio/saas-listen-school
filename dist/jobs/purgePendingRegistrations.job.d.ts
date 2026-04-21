/**
 * Supprime les comptes élèves créés via inscription + OTP mais jamais finalisés
 * (emailVerified=false au-delà de PENDING_REGISTRATION_TTL_MINUTES), ou désactivés
 * après trop de tentatives OTP, sans session refresh.
 */
export declare function purgeStaleUnverifiedRegistrations(): Promise<number>;
//# sourceMappingURL=purgePendingRegistrations.job.d.ts.map