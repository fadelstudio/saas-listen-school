import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../core/config/env';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../core/errors/AppError';
import { authRepository } from './auth.repository';
import {
  RegisterInput,
  LoginInput,
  ChangePasswordInput,
  UpdateProfileInput,
  AuthResponse,
  SafeUser,
} from './auth.types';
import { Role } from '@prisma/client';

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toSafeUser(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
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
    campusId: user.campusId,
    classId: user.classId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function generateTokens(userId: string, role: string) {
  const payload = { userId, role };
  const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  
  const refreshTokenString = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await authRepository.createRefreshToken(userId, refreshTokenString, expiresAt);

  return { accessToken, refreshToken: refreshTokenString };
}

// ─── Service ──────────────────────────────────────────────────────────────────

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

    const { accessToken, refreshToken } = await generateTokens(user.id, user.role);

    return { token: accessToken, refreshToken, user: toSafeUser(user) };
  },

  async login(input: LoginInput): Promise<AuthResponse> {
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

    const { accessToken, refreshToken } = await generateTokens(user.id, user.role);

    return { token: accessToken, refreshToken, user: toSafeUser(user) };
  },

  async refresh(token: string): Promise<Pick<AuthResponse, 'token' | 'refreshToken'>> {
    const stored = await authRepository.findRefreshToken(token);
    
    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await authRepository.deleteRefreshToken(token);
      throw new UnauthorizedError('Refresh token invalid or expired');
    }

    // Rotate token: delete old, create new
    await authRepository.deleteRefreshToken(token);
    const user = stored.user;
    const { accessToken, refreshToken } = await generateTokens(user.id, user.role);

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
