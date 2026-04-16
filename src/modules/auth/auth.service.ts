import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../core/config/env';
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
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyLoginOtpInput,
} from './auth.types';
import { Role } from '@prisma/client';
import { sendTransactionalEmail } from '../../core/email/mail.service';

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

async function isOtpRequired(): Promise<boolean> {
  // 1. Check ENV (global force)
  if (env.LOGIN_OTP_ENABLED) return true;

  // 2. Check Database Settings
  const settings = await prisma.systemSettings.findFirst();
  return settings?.authOtpRequired ?? false;
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

function toSafeUser(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  emailVerified: boolean;
  campusId: string | null;
  classId: string | null;
  schoolId: string | null;
  createdAt: Date;
  updatedAt: Date;
}): SafeUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    campusId: user.campusId,
    classId: user.classId,
    schoolId: user.schoolId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

type TokenUser = {
  id: string;
  role: string;
  schoolId: string | null;
  campusId: string | null;
  classId: string | null;
};

async function generateTokens(user: TokenUser) {
  const payload: Record<string, unknown> = {
    userId: user.id,
    role: user.role,
  };
  if (user.schoolId != null) payload.schoolId = user.schoolId;
  if (user.campusId != null) payload.campusId = user.campusId;
  if (user.classId != null) payload.classId = user.classId;

  const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });

  const refreshTokenString = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await authRepository.createRefreshToken(user.id, refreshTokenString, expiresAt);

  return { accessToken, refreshToken: refreshTokenString };
}

export const authService = {
  async register(input: RegisterInput): Promise<LoginResult> {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await authRepository.create({
      ...input,
      passwordHash,
    });

    if (!(await isOtpRequired())) {
      const { accessToken, refreshToken } = await generateTokens({
        id: user.id,
        role: user.role,
        schoolId: user.schoolId,
        campusId: user.campusId,
        classId: user.classId,
      });
      return { token: accessToken, refreshToken, user: toSafeUser(user) };
    }

    return this.sendNewLoginOtp(user);
  },

  async login(input: LoginInput): Promise<LoginResult> {
    const identifier = input.email || input.matricule;
    if (!identifier) {
      throw new UnauthorizedError('Email or matricule must be provided');
    }

    const user = await authRepository.findByIdentifier(identifier);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated. Contact an administrator.');
    }

    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const { accessToken, refreshToken } = await generateTokens({
      id: user.id,
      role: user.role,
      schoolId: user.schoolId,
      campusId: user.campusId,
      classId: user.classId,
    });
    return { token: accessToken, refreshToken, user: toSafeUser(user) };
  },

  async sendNewLoginOtp(user: { id: string; email: string }) {
    const otp = generateNumericOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
    const challenge = await authRepository.createLoginOtpChallenge(user.id, otpHash, expiresAt);

    const otpExpiresMin = Math.floor(OTP_EXPIRY_MS / 60000);
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333;">Code de vérification AFI-LISTEN</h2>
        <p>Bonjour,</p>
        <p>Voici votre code de sécurité pour vous connecter à votre compte. Ce code est valide pendant ${otpExpiresMin} minutes.</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000; border-radius: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #666; font-size: 14px;">Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email en toute sécurité.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} AFI-LISTEN. Tous droits réservés.</p>
      </div>
    `;

    await sendTransactionalEmail({
      to: user.email,
      subject: 'Code de connexion AFI-LISTEN',
      text: `Votre code de connexion : ${otp}\nElle expire dans ${otpExpiresMin} minutes.`,
      html,
    }).catch((err) => {
      console.error('Failed to send OTP email:', err);
    });

    return {
      step: 'EMAIL_OTP_REQUIRED' as const,
      challengeId: challenge.id,
      expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
    };
  },

  async verifyLoginOtp(input: VerifyLoginOtpInput): Promise<AuthResponse> {
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
    if (expected !== challenge.otpHash) {
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

    const { accessToken, refreshToken } = await generateTokens({
      id: user.id,
      role: user.role,
      schoolId: user.schoolId,
      campusId: user.campusId,
      classId: user.classId,
    });

    return { token: accessToken, refreshToken, user: toSafeUser(user) };
  },

  async forgotPassword(input: ForgotPasswordInput): Promise<void> {
    const user = await authRepository.findByEmail(input.email);
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
    const { accessToken, refreshToken } = await generateTokens({
      id: user.id,
      role: user.role,
      schoolId: user.schoolId,
      campusId: user.campusId,
      classId: user.classId,
    });

    return { token: accessToken, refreshToken };
  },

  async logout(token: string): Promise<void> {
    await authRepository.deleteRefreshToken(token).catch(() => {});
  },

  async getMe(userId: string): Promise<SafeUser> {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    return toSafeUser(user);
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

    const updated = await authRepository.updateProfile(userId, input);
    return toSafeUser(updated);
  },

  async resendOtp(challengeId: string) {
    const oldChallenge = await authRepository.findLoginOtpChallengeById(challengeId);
    if (!oldChallenge) {
      throw new BadRequestError('Invalid or expired challenge session');
    }
    // Delete all existing challenges to avoid stale ones
    await authRepository.deleteLoginChallengesForUser(oldChallenge.userId);
    return this.sendNewLoginOtp(oldChallenge.user);
  },
};
