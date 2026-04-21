/**
 * En mode strict, `DEFAULT_SCHOOL_SLUG` n'est pas utilisé pour la résolution — pas de contrôle DB.
 * En mode non strict, vérifie que le slug par défaut existe dans `schools` (évite typos silencieuses).
 * En production non strict, une valeur invalide fait échouer le démarrage.
 */
export declare function validateTenantEnvOnStartup(): Promise<void>;
//# sourceMappingURL=validateTenantEnv.d.ts.map