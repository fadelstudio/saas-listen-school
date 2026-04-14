import { User } from '@prisma/client';
import { prisma } from '../../core/database/prisma';
import { RegisterInput } from './auth.types';

export const authRepository = {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  async findByIdentifier(identifier: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { matricule: identifier }
        ]
      }
    });
  },

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  async create(data: RegisterInput & { passwordHash: string }): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        campusId: data.campusId,
        classId: data.classId,
        emailVerified: false,
        emailVerifiedAt: null,
      },
    });
  },

  async updatePassword(userId: string, passwordHash: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  },

  async updateProfile(
    userId: string,
    data: { firstName?: string; lastName?: string }
  ): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  },

  // ─── Refresh Tokens ─────────────────────────────────────────────────────────

  async createRefreshToken(userId: string, token: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  },

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  },

  async deleteRefreshToken(token: string) {
    return prisma.refreshToken.delete({
      where: { token },
    });
  },

  async deleteAllUserRefreshTokens(userId: string) {
    return prisma.refreshToken.deleteMany({
      where: { userId },
    });
  },

  async setActive(userId: string, isActive: boolean): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
  },

  async deleteLoginChallengesForUser(userId: string) {
    return prisma.loginOtpChallenge.deleteMany({ where: { userId } });
  },

  async createLoginOtpChallenge(userId: string, otpHash: string, expiresAt: Date) {
    return prisma.loginOtpChallenge.create({
      data: { userId, otpHash, expiresAt },
    });
  },

  async findLoginOtpChallengeById(id: string) {
    return prisma.loginOtpChallenge.findUnique({
      where: { id },
      include: { user: true },
    });
  },

  async incrementLoginOtpAttempts(id: string) {
    return prisma.loginOtpChallenge.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });
  },

  async deleteLoginOtpChallenge(id: string) {
    return prisma.loginOtpChallenge.delete({ where: { id } }).catch(() => {});
  },

  async deletePasswordResetTokensForUser(userId: string) {
    return prisma.passwordResetToken.deleteMany({ where: { userId } });
  },

  async createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.passwordResetToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  },

  async findPasswordResetByTokenHash(tokenHash: string) {
    return prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  },

  async markPasswordResetUsed(id: string) {
    return prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  },
};
