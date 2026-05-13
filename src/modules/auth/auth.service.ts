import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../core/config/env';
/// <reference types="multer" />
import { prisma } from '../../core/database/prisma';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} from '../../core/errors/AppError';
import { authRepository } from './auth.repository';
import {
  RegisterInput,
  LoginInput,
  ChangePasswordInput,
  UpdateProfileInput,
  AuthResponse,
  SafeUser,
  LoginResult,
  RegisterResult,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyRegisterOtpInput,
  GoogleCompleteInput,
  GoogleAuthResult,
} from './auth.types';
import { isGoogleAuthConfigured, verifyGoogleIdToken } from './google-id-token';
import { Role, User } from '@prisma/client';
import { sendTransactionalEmail } from '../../core/email/mail.service';
import { mailTemplates } from '../../core/email/mail.templates';
import { uploadsService } from '../uploads/uploads.service';
import { notificationService } from '../notifications/notifications.service';
import { logger } from '../../utils/logger';

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY_DAYS = 30;
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;
const GOOGLE_PENDING_PURPOSE = 'google_student_pending' as const;
const GOOGLE_PENDING_EXPIRY_SEC = 15 * 60;

type GooglePendingJwt = {
  purpose: typeof GOOGLE_PENDING_PURPOSE;
  kind: 'new' | 'link';
  googleSub: string;
  schoolId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  userId?: string;
};

function signGooglePendingJwt(payload: Omit<GooglePendingJwt, 'purpose'>): string {
  return jwt.sign(
    { ...payload, purpose: GOOGLE_PENDING_PURPOSE },
    env.JWT_SECRET,
    { expiresIn: GOOGLE_PENDING_EXPIRY_SEC }
  );
}

function verifyGooglePendingJwt(token: string): GooglePendingJwt {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as GooglePendingJwt;
    if (decoded.purpose !== GOOGLE_PENDING_PURPOSE) {
      throw new UnauthorizedError('Invalid pending token');
    }
    return decoded;
  } catch (e) {
    if (e instanceof UnauthorizedError) throw e;
    throw new UnauthorizedError('Invalid or expired pending token');
  }
}

async function assertClassBelongsToSchool(
  schoolId: string,
  classId: string,
  campusId: string | null | undefined
): Promise<{ resolvedCampusId: string }> {
  const cls = await prisma.class.findFirst({
    where: {
      id: classId,
      campus: { schoolId },
    },
    select: { campusId: true },
  });
  if (!cls) {
    throw new BadRequestError('Invalid class for this school');
  }
  if (campusId && campusId !== cls.campusId) {
    throw new BadRequestError('The selected class does not belong to this campus');
  }
  return { resolvedCampusId: cls.campusId };
}

async function isRegisterOtpRequiredForSchool(schoolId: string | null): Promise<boolean> {
  // 1) ENV can force OTP for registration globally
  if (env.LOGIN_OTP_ENABLED) return true;

  // 2) Per-school DB setting when available; fallback to first row for legacy single-school DBs
  const settings = schoolId
    ? await prisma.systemSettings.findUnique({ where: { schoolId } }).catch(() => null)
    : null;
  if (settings) return settings.authOtpRequired ?? false;

  const first = await prisma.systemSettings.findFirst();
  return first?.authOtpRequired ?? false;
}

function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(`${otp}:${env.JWT_SECRET}`).digest('hex');
}

function hashResetToken(token: string): string {
  return crypto.createHash('sha256').update(`${token}:${env.JWT_SECRET}`).digest('hex');
}

function generateNumericOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function canUseOtpFallback(): boolean {
  return env.OTP_FALLBACK_ENABLED && !!env.OTP_FALLBACK_CODE;
}

function toSafeUser(user: User & {
  campuses?: { id: string, name?: string }[],
  class?: { id: string, name: string } | null
}): SafeUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    sex: (user as any).sex || 'MALE',
    role: user.role,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    matricule: user.matricule,
    numero: user.numero,
    phone: user.phone,
    bio: user.bio,
    address: user.address,
    campusIds: user.campuses?.map((c: any) => c.id) || [],
    campuses: user.campuses?.map((c: any) => ({ id: c.id, name: c.name || '' })),
    classId: user.classId,
    class: user.class ? { id: user.class.id, name: user.class.name } : null,
    schoolId: user.schoolId,
    hasPassword: !!(user as { passwordHash?: string | null }).passwordHash,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function toSafeUserWithAvatar(user: User & {
  campuses?: { id: string, name?: string }[],
  class?: { id: string, name: string } | null
}): Promise<SafeUser> {
  const base = toSafeUser(user);
  const avatarUrl = await uploadsService.getSignedUrlForPath(user.avatarPath);
  return { ...base, avatarUrl };
}

type TokenUser = {
  id: string;
  role: string;
  schoolId: string | null;
  campusIds: string[];
  classId: string | null;
};

async function generateTokens(user: TokenUser) {
  let resolvedSchoolId = user.schoolId;
  if (user.role !== Role.SUPERADMIN && !resolvedSchoolId && user.campusIds.length > 0) {
    const campus = await prisma.campus.findUnique({
      where: { id: user.campusIds[0] },
      select: { schoolId: true },
    });
    resolvedSchoolId = campus?.schoolId || null;
  }

  if (user.role !== Role.SUPERADMIN && !resolvedSchoolId) {
    throw new UnauthorizedError(
      'Account is missing school assignment. Contact an administrator.'
    );
  }

  // Create a unique session ID for single session enforcement
  const sessionId = crypto.randomBytes(16).toString('hex');

  // Update user with the new session ID
  await prisma.user.update({
    where: { id: user.id },
    data: { currentSessionId: sessionId }
  });

  const payload: Record<string, unknown> = {
    userId: user.id,
    role: user.role,
    sid: sessionId // 'sid' for session ID
  };
  if (resolvedSchoolId != null) payload.schoolId = resolvedSchoolId;
  if (user.campusIds.length > 0) payload.campusIds = user.campusIds;
  if (user.classId != null) payload.classId = user.classId;

  const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });

  const refreshTokenString = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await authRepository.createRefreshToken(user.id, refreshTokenString, expiresAt);

  return { accessToken, refreshToken: refreshTokenString };
}

export const authService = {
  async register(input: RegisterInput, schoolId: string): Promise<RegisterResult> {
    logger.info('[AuthService] Registering student', { email: input.email, classId: input.classId, schoolId });
    if (!input.classId) {
      throw new BadRequestError('Student must be assigned to a class');
    }

    const existing = await authRepository.findByEmail(input.email, schoolId);
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const otpRequired = await isRegisterOtpRequiredForSchool(schoolId);

    // If student chooses a class but no campus, resolve the campus from the class
    let campusId = input.campusId;
    if (input.classId && !campusId) {
      const classRecord = await prisma.class.findUnique({
        where: { id: input.classId },
        select: { campusId: true }
      });
      if (classRecord) campusId = classRecord.campusId;
    }

    const user = await authRepository.create({
      ...input,
      campusId,
      passwordHash,
      schoolId,
      emailVerified: !otpRequired,
    });

    if (!otpRequired) {
      const { accessToken, refreshToken } = await generateTokens({
        id: user.id,
        role: user.role,
        schoolId: user.schoolId,
        campusIds: user.campuses?.map((c: any) => c.id) || [],
        classId: user.classId,
      });
      return { token: accessToken, refreshToken, user: await toSafeUserWithAvatar(user) };
    }

    return this.sendNewRegisterOtp(user);
  },

  async login(input: LoginInput, schoolId: string): Promise<LoginResult> {
    const identifier = input.email || input.matricule;
    if (!identifier) {
      throw new UnauthorizedError('Email or matricule must be provided');
    }

    const user = await authRepository.findByIdentifier(identifier, schoolId);
    if (!user) {
      const globalUser = await authRepository.findByIdentifierGlobal(identifier);
      if (
        globalUser?.schoolId &&
        globalUser.schoolId !== schoolId &&
        globalUser.school?.slug
      ) {
        throw new UnauthorizedError(
          `Wrong school context: this account is for school "${globalUser.school.slug}". ` +
          `Call the API with header x-school-slug: ${globalUser.school.slug} (or open /${globalUser.school.slug}/api/... in non-strict mode).`,
        );
      }
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated. Contact an administrator.');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedError(
        'Email not verified. Use the code sent to your inbox or request a new code from the registration flow.',
      );
    }

    if (!user.passwordHash) {
      throw new UnauthorizedError('This account uses Google sign-in. Please use the Google button.');
    }

    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const { accessToken, refreshToken } = await generateTokens({
      id: user.id,
      role: user.role,
      schoolId: user.schoolId,
      campusIds: user.campuses?.map((c: any) => c.id) || [],
      classId: user.classId,
    });

    // ── WELCOME NOTIFICATION (désactivable via NOTIFY_ON_LOGIN=false) ──
    if (process.env.NOTIFY_ON_LOGIN !== 'false') {
      notificationService.create({
        title: 'Connexion réussie',
        message: `Bienvenue, ${user.firstName} ! Vous êtes connecté(e) à votre espace AFI-LISTEN.`,
        type: 'LOGIN_WELCOME',
        userId: user.id,
        schoolId: user.schoolId,
      }).catch(err => logger.warn('[Notification] login welcome failed', { error: err.message }));
    }


    return { token: accessToken, refreshToken, user: await toSafeUserWithAvatar(user) };
  },

  async sendNewRegisterOtp(user: { id: string; email: string }) {
    const otp = generateNumericOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
    const challenge = await authRepository.createLoginOtpChallenge(user.id, otpHash, expiresAt);

    const otpExpiresMin = Math.floor(OTP_EXPIRY_MS / 60000);
    const siteName = env.OTP_SITE_NAME || 'AFI-LISTEN';
    const publicUrl = env.PUBLIC_APP_URL.replace(/\/$/, '');
    const helpUrl = env.OTP_HELP_URL ? env.OTP_HELP_URL : publicUrl;

    // Direct link to verify email via the API (one-click)
    const verifyUrl = `${publicUrl}/api/auth/register/verify-link?challengeId=${challenge.id}`;
    const html = mailTemplates.otpTemplate(otp, otpExpiresMin, verifyUrl);

    sendTransactionalEmail({
      to: user.email,
      subject: env.OTP_EMAIL_SUBJECT || `Code de vérification ${siteName}`,
      text: `Votre code de vérification : ${otp}\nIl expire dans ${otpExpiresMin} minutes.\nAide: ${helpUrl}`,
      html,
    }).catch((err: any) => {
      logger.error('[AuthService] Failed to queue OTP email', { error: err?.message });
    });

    return {
      step: 'REGISTER_OTP_REQUIRED' as const,
      challengeId: challenge.id,
      expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
    };
  },

  async verifyRegisterOtp(input: VerifyRegisterOtpInput, schoolId: string): Promise<AuthResponse> {
    const challenge = await authRepository.findLoginOtpChallengeById(input.challengeId);
    if (!challenge || challenge.expiresAt < new Date()) {
      if (challenge) await authRepository.deleteLoginOtpChallenge(challenge.id);
      throw new UnauthorizedError('Invalid or expired OTP challenge');
    }

    if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
      await authRepository.deleteLoginOtpChallenge(challenge.id);
      throw new BadRequestError('Too many OTP attempts. Please log in again.');
    }

    const expected = hashOtp(input.otp.trim());
    const fallbackMatch = canUseOtpFallback() && input.otp.trim() === env.OTP_FALLBACK_CODE;
    if (expected !== challenge.otpHash && !fallbackMatch) {
      const updated = await authRepository.incrementLoginOtpAttempts(challenge.id);

      if (updated.attempts >= OTP_MAX_ATTEMPTS) {
        await authRepository.deleteLoginOtpChallenge(challenge.id);
        await authRepository.setActive(challenge.userId, false); // Block account
        throw new BadRequestError('Too many OTP attempts. Your account has been deactivated for security reasons. Contact support.');
      }

      throw new UnauthorizedError(`Invalid OTP code (${OTP_MAX_ATTEMPTS - updated.attempts} attempts remaining)`);
    }

    await authRepository.deleteLoginOtpChallenge(challenge.id);
    const user = challenge.user;
    if (user.schoolId !== schoolId) {
      throw new UnauthorizedError('Invalid OTP challenge for this school context');
    }

    const verifiedUser = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifiedAt: new Date() },
      include: { campuses: { select: { id: true } } },
    });

    const { accessToken, refreshToken } = await generateTokens({
      id: verifiedUser.id,
      role: verifiedUser.role,
      schoolId: verifiedUser.schoolId,
      campusIds: (verifiedUser as any).campuses?.map((c: any) => c.id) || [],
      classId: verifiedUser.classId,
    });

    return { token: accessToken, refreshToken, user: await toSafeUserWithAvatar(verifiedUser) };
  },

  async verifyRegisterLink(challengeId: string): Promise<string> {
    const challenge = await authRepository.findLoginOtpChallengeById(challengeId);
    if (!challenge || challenge.expiresAt < new Date()) {
      if (challenge) await authRepository.deleteLoginOtpChallenge(challenge.id);
      return `${env.PUBLIC_WEB_URL}/verify-error?reason=expired`;
    }

    const user = await prisma.user.findUnique({
      where: { id: challenge.userId },
      include: { school: true },
    });

    if (!user) return `${env.PUBLIC_WEB_URL}/verify-error?reason=user_not_found`;

    await authRepository.deleteLoginOtpChallenge(challenge.id);
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifiedAt: new Date() },
    });

    const slug = user.school?.slug || 'afi';
    return `${env.PUBLIC_WEB_URL}/${slug}/login?verified=true`;
  },

  async forgotPassword(input: ForgotPasswordInput, schoolId: string): Promise<void> {
    const user = await authRepository.findByEmail(input.email, schoolId);
    if (!user) {
      return;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

    await authRepository.deletePasswordResetTokensForUser(user.id);
    await authRepository.createPasswordResetToken(user.id, tokenHash, expiresAt);

    const slug = user.school?.slug || 'afi';
    const resetUrl = `${env.PUBLIC_WEB_URL.replace(/\/$/, '')}/${slug}/reset-password?token=${rawToken}`;
    const html = mailTemplates.passwordResetTemplate(resetUrl);

    sendTransactionalEmail({
      to: user.email,
      subject: 'Réinitialisation du mot de passe AFI-LISTEN',
      text: `Vous avez demandé une réinitialisation de mot de passe. Ouvrez ce lien (valide 1 heure) : ${resetUrl}`,
      html,
    }).catch((err: any) => {
      logger.error('[AuthService] Failed to queue password reset email', { error: err?.message });
    });
  },

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const tokenHash = hashResetToken(input.token.trim());
    const record = await authRepository.findPasswordResetByTokenHash(tokenHash);

    if (!record || record.expiresAt < new Date() || record.usedAt) {
      throw new UnauthorizedError('Invalid or expired reset token');
    }

    const user = record.user;
    const newHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
    await authRepository.updatePassword(user.id, newHash);
    await authRepository.markPasswordResetUsed(record.id);
    await authRepository.deleteAllUserRefreshTokens(user.id);
  },

  async refresh(token: string): Promise<Pick<AuthResponse, 'token' | 'refreshToken'>> {
    const stored = await authRepository.findRefreshToken(token);

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await authRepository.deleteRefreshToken(token);
      throw new UnauthorizedError('Refresh token invalid or expired');
    }

    await authRepository.deleteRefreshToken(token);
    const user = stored.user;
    if (!user.emailVerified) {
      throw new UnauthorizedError('Session ended: email verification required.');
    }
    const { accessToken, refreshToken } = await generateTokens({
      id: user.id,
      role: user.role,
      schoolId: user.schoolId,
      campusIds: user.campuses?.map((c: any) => c.id) || [],
      classId: user.classId,
    });

    return { token: accessToken, refreshToken };
  },

  async logout(token: string): Promise<void> {
    await authRepository.deleteRefreshToken(token).catch(() => { });
  },

  async getMe(userId: string): Promise<SafeUser> {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    return toSafeUserWithAvatar(user);
  },

  async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    if (user.passwordHash) {
      const current = input.currentPassword ?? '';
      if (!current) {
        throw new BadRequestError('Current password is required');
      }
      const isValid = await bcrypt.compare(current, user.passwordHash);
      if (!isValid) {
        throw new UnauthorizedError('Current password is incorrect');
      }
    }

    const newHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
    await authRepository.updatePassword(userId, newHash);
  },

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<SafeUser> {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const trimOrNull = (v: string | null | undefined) => {
      if (v === undefined) return undefined;
      if (v === null) return null;
      const t = v.trim();
      return t === '' ? null : t;
    };

    const matricule = input.matricule !== undefined ? trimOrNull(input.matricule) : undefined;
    if (matricule !== undefined && matricule !== user.matricule) {
      if (matricule) {
        const taken = await prisma.user.findFirst({
          where: { matricule, NOT: { id: userId } },
        });
        if (taken) throw new ConflictError('Matricule already in use');
      }
    }

    const payload: any = {
      ...(input.firstName !== undefined && { firstName: input.firstName }),
      ...(input.lastName !== undefined && { lastName: input.lastName }),
      ...(input.matricule !== undefined && { matricule }),
      ...(input.numero !== undefined && { numero: trimOrNull(input.numero) ?? null }),
      ...(input.phone !== undefined && { phone: trimOrNull(input.phone) ?? null }),
      ...(input.bio !== undefined && { bio: trimOrNull(input.bio) ?? null }),
      ...(input.address !== undefined && { address: trimOrNull(input.address) ?? null }),
      ...(input.sex !== undefined && { sex: input.sex }),
    };

    if (Object.keys(payload).length === 0) {
      return toSafeUserWithAvatar(user);
    }

    const updated = await authRepository.updateProfile(userId, payload);
    return toSafeUserWithAvatar(updated);
  },

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<SafeUser> {
    const user = await authRepository.findById(userId);
    if (!user) throw new NotFoundError('User');
    const { path } = await uploadsService.uploadProfileImage(file, `avatars/users/${userId}`);
    if (user.avatarPath && user.avatarPath !== path) {
      await uploadsService.removeObjectAtPath(user.avatarPath).catch(() => { });
    }
    const updated = await authRepository.updateAvatarPath(userId, path);
    return toSafeUserWithAvatar(updated);
  },

  async clearAvatar(userId: string): Promise<SafeUser> {
    const user = await authRepository.findById(userId);
    if (!user) throw new NotFoundError('User');
    if (user.avatarPath) {
      await uploadsService.removeObjectAtPath(user.avatarPath).catch(() => { });
    }
    const updated = await authRepository.updateAvatarPath(userId, null);
    return toSafeUserWithAvatar(updated);
  },

  async googleStart(idToken: string, schoolId: string): Promise<GoogleAuthResult> {
    if (!isGoogleAuthConfigured()) {
      throw new BadRequestError('Google sign-in is not configured on this server');
    }

    let g: Awaited<ReturnType<typeof verifyGoogleIdToken>>;
    try {
      g = await verifyGoogleIdToken(idToken);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn('[AuthService] Google token verification failed', { message: msg });
      throw new UnauthorizedError('Invalid Google credentials');
    }

    if (!g.emailVerified) {
      throw new BadRequestError(
        'Your Google account email must be verified before you can sign in',
      );
    }

    const lowerEmail = g.email.trim().toLowerCase();

    const byGoogle = await authRepository.findByGoogleId(g.sub);
    if (byGoogle) {
      if (byGoogle.schoolId !== schoolId) {
        const slug = byGoogle.school?.slug || 'another school';
        throw new UnauthorizedError(
          `This Google account is already linked to another school (${slug}). Open that school’s portal.`,
        );
      }
      if (!byGoogle.isActive) {
        throw new UnauthorizedError('Account is deactivated. Contact an administrator.');
      }
      if (!byGoogle.emailVerified) {
        throw new UnauthorizedError(
          'Email not verified. Complete verification or contact support.',
        );
      }
      if (byGoogle.role === Role.STUDENT && !byGoogle.classId) {
        return {
          step: 'GOOGLE_SELECT_CLASS',
          pendingToken: signGooglePendingJwt({
            kind: 'link',
            googleSub: g.sub,
            schoolId,
            userId: byGoogle.id,
          }),
          expiresInSeconds: GOOGLE_PENDING_EXPIRY_SEC,
        };
      }

      const { accessToken, refreshToken } = await generateTokens({
        id: byGoogle.id,
        role: byGoogle.role,
        schoolId: byGoogle.schoolId,
        campusIds: byGoogle.campuses?.map((c) => c.id) || [],
        classId: byGoogle.classId,
      });

      if (process.env.NOTIFY_ON_LOGIN !== 'false') {
        notificationService
          .create({
            title: 'Connexion réussie',
            message: `Bienvenue, ${byGoogle.firstName} ! Vous êtes connecté(e) à votre espace AFI-LISTEN.`,
            type: 'LOGIN_WELCOME',
            userId: byGoogle.id,
            schoolId: byGoogle.schoolId,
          })
          .catch((err) =>
            logger.warn('[Notification] login welcome failed', { error: (err as Error)?.message }),
          );
      }

      return { token: accessToken, refreshToken, user: await toSafeUserWithAvatar(byGoogle) };
    }

    const existing = await authRepository.findByEmailGlobal(lowerEmail);
    if (existing) {
      if (existing.schoolId !== schoolId) {
        const slug = existing.school?.slug || 'another tenant';
        throw new UnauthorizedError(
          `This email is registered with another school (${slug}). Use the correct school URL or header x-school-slug.`,
        );
      }
      if (existing.passwordHash && !existing.googleId) {
        throw new ConflictError(
          'An account with this email already exists. Sign in with your password or use forgot password.',
        );
      }
      if (existing.googleId && existing.googleId !== g.sub) {
        throw new ConflictError('This email is already linked to a different Google account.');
      }
      if (!existing.passwordHash && !existing.googleId) {
        throw new BadRequestError('This account cannot use Google sign-in. Contact support.');
      }
      throw new ConflictError('Unable to start Google sign-in with this email. Try signing in again.');
    }

    return {
      step: 'GOOGLE_SELECT_CLASS',
      pendingToken: signGooglePendingJwt({
        kind: 'new',
        googleSub: g.sub,
        schoolId,
        email: lowerEmail,
        firstName: g.firstName,
        lastName: g.lastName,
      }),
      expiresInSeconds: GOOGLE_PENDING_EXPIRY_SEC,
    };
  },

  async googleComplete(input: GoogleCompleteInput, schoolId: string): Promise<GoogleAuthResult> {
    const pending = verifyGooglePendingJwt(input.pendingToken);
    if (pending.schoolId !== schoolId) {
      throw new UnauthorizedError('Invalid session for this school context');
    }

    const { resolvedCampusId } = await assertClassBelongsToSchool(
      schoolId,
      input.classId,
      input.campusId,
    );

    if (pending.kind === 'link' && pending.userId) {
      const user = await prisma.user.findUnique({
        where: { id: pending.userId },
        include: {
          campuses: { select: { id: true, name: true } },
          class: { select: { id: true, name: true } },
        },
      });
      if (!user || user.googleId !== pending.googleSub || user.schoolId !== schoolId) {
        throw new UnauthorizedError('Invalid or expired Google sign-in session');
      }
      if (user.role !== Role.STUDENT) {
        throw new BadRequestError('Only students use the class selection step.');
      }

      const updated = await authRepository.updateStudentClassAndCampus(
        user.id,
        input.classId,
        resolvedCampusId,
      );

      const { accessToken, refreshToken } = await generateTokens({
        id: updated.id,
        role: updated.role,
        schoolId: updated.schoolId,
        campusIds: updated.campuses?.map((c) => c.id) || [],
        classId: updated.classId,
      });

      if (process.env.NOTIFY_ON_LOGIN !== 'false') {
        notificationService
          .create({
            title: 'Connexion réussie',
            message: `Bienvenue, ${updated.firstName} ! Vous êtes connecté(e) à votre espace AFI-LISTEN.`,
            type: 'LOGIN_WELCOME',
            userId: updated.id,
            schoolId: updated.schoolId,
          })
          .catch((err) =>
            logger.warn('[Notification] login welcome failed', { error: (err as Error)?.message }),
          );
      }

      return { token: accessToken, refreshToken, user: await toSafeUserWithAvatar(updated) };
    }

    if (pending.kind === 'new') {
      if (!pending.email || pending.firstName === undefined || pending.lastName === undefined) {
        throw new UnauthorizedError('Invalid pending token payload');
      }

      const dup = await authRepository.findByEmailGlobal(pending.email);
      if (dup) {
        throw new ConflictError('An account was created with this email meanwhile. Sign in again.');
      }

      const otpRequired = await isRegisterOtpRequiredForSchool(schoolId);
      const user = await authRepository.createStudentFromGoogle({
        email: pending.email,
        firstName: pending.firstName,
        lastName: pending.lastName,
        schoolId,
        classId: input.classId,
        campusId: resolvedCampusId,
        googleId: pending.googleSub,
        emailVerified: !otpRequired,
      });

      if (!otpRequired) {
        const { accessToken, refreshToken } = await generateTokens({
          id: user.id,
          role: user.role,
          schoolId: user.schoolId,
          campusIds: user.campuses?.map((c) => c.id) || [],
          classId: user.classId,
        });
        if (process.env.NOTIFY_ON_LOGIN !== 'false') {
          notificationService
            .create({
              title: 'Connexion réussie',
              message: `Bienvenue, ${user.firstName} ! Vous êtes connecté(e) à votre espace AFI-LISTEN.`,
              type: 'LOGIN_WELCOME',
              userId: user.id,
              schoolId: user.schoolId,
            })
            .catch((err) =>
              logger.warn('[Notification] login welcome failed', { error: (err as Error)?.message }),
            );
        }
        return { token: accessToken, refreshToken, user: await toSafeUserWithAvatar(user) };
      }

      return this.sendNewRegisterOtp(user);
    }

    throw new UnauthorizedError('Invalid Google sign-in session');
  },

  async resendOtp(challengeId: string, schoolId: string) {
    const oldChallenge = await authRepository.findLoginOtpChallengeById(challengeId);
    if (!oldChallenge) {
      throw new BadRequestError('Invalid or expired challenge session');
    }
    if (oldChallenge.user.schoolId !== schoolId) {
      throw new BadRequestError('Invalid or expired challenge session');
    }
    // Delete all existing challenges to avoid stale ones
    await authRepository.deleteLoginChallengesForUser(oldChallenge.userId);
    return this.sendNewRegisterOtp(oldChallenge.user);
  },

  async resendVerification(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user) throw new NotFoundError('User');
    if (user.emailVerified) throw new BadRequestError('Email is already verified');

    // Delete existing challenges
    await authRepository.deleteLoginChallengesForUser(userId);
    return this.sendNewRegisterOtp(user);
  },
};
