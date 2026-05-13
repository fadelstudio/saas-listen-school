export type VerifiedGoogleIdentity = {
    sub: string;
    email: string;
    emailVerified: boolean;
    firstName: string;
    lastName: string;
    picture?: string;
};
export declare function isGoogleAuthConfigured(): boolean;
/**
 * Vérifie un `id_token` Google (Sign-In Web / mobile) contre les Client IDs autorisés.
 */
export declare function verifyGoogleIdToken(idToken: string): Promise<VerifiedGoogleIdentity>;
//# sourceMappingURL=google-id-token.d.ts.map