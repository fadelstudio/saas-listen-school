"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGoogleAuthConfigured = isGoogleAuthConfigured;
exports.verifyGoogleIdToken = verifyGoogleIdToken;
const google_auth_library_1 = require("google-auth-library");
const env_1 = require("../../core/config/env");
const oauthClient = new google_auth_library_1.OAuth2Client();
function getGoogleAudiences() {
    const raw = env_1.env.GOOGLE_OAUTH_CLIENT_IDS?.trim();
    if (!raw)
        return [];
    return raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
}
function isGoogleAuthConfigured() {
    return getGoogleAudiences().length > 0;
}
/**
 * Vérifie un `id_token` Google (Sign-In Web / mobile) contre les Client IDs autorisés.
 */
async function verifyGoogleIdToken(idToken) {
    const audience = getGoogleAudiences();
    if (audience.length === 0) {
        throw new Error('GOOGLE_OAUTH_CLIENT_IDS is not configured');
    }
    const ticket = await oauthClient.verifyIdToken({
        idToken,
        audience,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
        throw new Error('Missing sub or email in Google token');
    }
    return {
        sub: payload.sub,
        email: payload.email.trim().toLowerCase(),
        emailVerified: payload.email_verified === true,
        firstName: (payload.given_name || '').trim() || 'User',
        lastName: (payload.family_name || '').trim() || 'Google',
        picture: payload.picture,
    };
}
//# sourceMappingURL=google-id-token.js.map