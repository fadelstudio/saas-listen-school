import { OAuth2Client } from 'google-auth-library';
import { env } from '../../core/config/env';

const oauthClient = new OAuth2Client();

export type VerifiedGoogleIdentity = {
  sub: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  picture?: string;
};

function getGoogleAudiences(): string[] {
  const raw = env.GOOGLE_OAUTH_CLIENT_IDS?.trim();
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isGoogleAuthConfigured(): boolean {
  return getGoogleAudiences().length > 0;
}

/**
 * Vérifie un `id_token` Google (Sign-In Web / mobile) contre les Client IDs autorisés.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<VerifiedGoogleIdentity> {
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
