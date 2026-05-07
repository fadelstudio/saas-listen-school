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
} from './auth.types';
import { Role, User } from '@prisma/client';
import { sendTransactionalEmail } from '../../core/email/mail.service';
import { uploadsService } from '../uploads/uploads.service';
import { notificationService } from '../notifications/notifications.service';

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

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

function toSafeUser(user: User & { campuses?: { id: string }[] }): SafeUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    sex: (user as any).sex || 'UNDEFINED',
    role: user.role,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    matricule: user.matricule,
    numero: user.numero,
    phone: user.phone,
    bio: user.bio,
    address: user.address,
    campusIds: user.campuses?.map((c: any) => c.id) || [],
    classId: user.classId,
    schoolId: user.schoolId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function toSafeUserWithAvatar(user: User & { campuses?: { id: string }[] }): Promise<SafeUser> {
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
      }).catch(err => console.warn('[Notification] login welcome failed', err));
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
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333;">Code de vérification ${siteName}</h2>
        <p>Bonjour,</p>
        <p>Voici votre code de sécurité pour confirmer votre inscription. Ce code est valide pendant ${otpExpiresMin} minutes.</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000; border-radius: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #666; font-size: 14px;">Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email en toute sécurité.</p>
        <p style="color: #666; font-size: 12px;">Besoin d'aide ? ${helpUrl}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} ${siteName}. Tous droits réservés.</p>
      </div>
    `;

    await sendTransactionalEmail({
      to: user.email,
      subject: env.OTP_EMAIL_SUBJECT || `Code de vérification ${siteName}`,
      text: `Votre code de vérification : ${otp}\nIl expire dans ${otpExpiresMin} minutes.\nAide: ${helpUrl}`,
      html,
    }).catch((err) => {
      console.error('Failed to send OTP email:', err);
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

    const resetUrl = `${env.PUBLIC_APP_URL.replace(/\/$/, '')}/reset-password?token=${rawToken}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333;">Réinitialisation de mot de passe</h2>
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe AFI-LISTEN. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien est valide pendant 1 heure.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #000; color: #fff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Réinitialiser mon mot de passe</a>
        </div>
        <p style="word-break: break-all; color: #999; font-size: 12px;">Si le bouton ne fonctionne pas, copiez ce lien : <br/> ${resetUrl}</p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} AFI-LISTEN. Tous droits réservés.</p>
      </div>
    `;

    await sendTransactionalEmail({
      to: user.email,
      subject: 'Réinitialisation du mot de passe AFI-LISTEN',
      text: `Vous avez demandé une réinitialisation de mot de passe. Ouvrez ce lien (valide 1 heure) : ${resetUrl}`,
      html,
    }).catch((err) => {
      console.error('Failed to send password reset email:', err);
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

    const isValid = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Current password is incorrect');
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
};
