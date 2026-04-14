import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../core/config/env';
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

function otpEnabled(): boolean {
  return process.env.LOGIN_OTP_ENABLED !== 'false';
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
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

type TokenUser = {
  id: string;
  role: string;
  campusId: string | null;
  classId: string | null;
};

async function generateTokens(user: TokenUser) {
  const payload: Record<string, unknown> = {
    userId: user.id,
    role: user.role,
  };
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
  async register(input: RegisterInput): Promise<AuthResponse> {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await authRepository.create({
      ...input,
      passwordHash,
    });

    const { accessToken, refreshToken } = await generateTokens({
      id: user.id,
      role: user.role,
      campusId: user.campusId,
      classId: user.classId,
    });

    return { token: accessToken, refreshToken, user: toSafeUser(user) };
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

    if (!otpEnabled()) {
      const { accessToken, refreshToken } = await generateTokens({
        id: user.id,
        role: user.role,
        campusId: user.campusId,
        classId: user.classId,
      });
      return { token: accessToken, refreshToken, user: toSafeUser(user) };
    }

    await authRepository.deleteLoginChallengesForUser(user.id);
    const otp = generateNumericOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
    const challenge = await authRepository.createLoginOtpChallenge(user.id, otpHash, expiresAt);

    await sendTransactionalEmail({
      to: user.email,
      subject: 'Code de connexion AFI-LISTEN',
      text: `Votre code de connexion (valide 10 minutes) : ${otp}\n\nSi vous n'avez pas demandé cette connexion, ignorez cet email.`,
    }).catch(() => {});

    return {
      step: 'EMAIL_OTP_REQUIRED',
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
      await authRepository.incrementLoginOtpAttempts(challenge.id);
      throw new UnauthorizedError('Invalid OTP code');
    }

    await authRepository.deleteLoginOtpChallenge(challenge.id);
    const user = challenge.user;

    const { accessToken, refreshToken } = await generateTokens({
      id: user.id,
      role: user.role,
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

    await sendTransactionalEmail({
      to: user.email,
      subject: 'Réinitialisation du mot de passe AFI-LISTEN',
      text: `Vous avez demandé une réinitialisation de mot de passe.\n\nOuvrez ce lien (valide 1 heure) :\n${resetUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.`,
    }).catch(() => {});
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
};
