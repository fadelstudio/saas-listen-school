import { User } from '@prisma/client';
import { prisma } from '../../core/database/prisma';
import { RegisterInput } from './auth.types';

export const authRepository = {
  async findByEmail(email: string, schoolId: string) {
    return prisma.user.findFirst({
      where: { email, schoolId },
      include: { 
        campuses: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } }
      },
    });
  },

  async findByIdentifier(identifier: string, schoolId: string) {
    return prisma.user.findFirst({
      where: {
        schoolId,
        OR: [
          { email: identifier },
          { matricule: identifier }
        ]
      },
      include: { 
        campuses: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } }
      },
    });
  },

  /** Pour message d’erreur login : compte connu mais mauvais tenant (x-school-slug). */
  async findByIdentifierGlobal(identifier: string) {
    return prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { matricule: identifier }],
      },
      include: { school: { select: { slug: true, name: true } } },
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { 
        campuses: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } }
      },
    });
  },

  async create(
    data: RegisterInput & {
      passwordHash: string;
      schoolId: string;
      /** Si false (OTP requis), compte créé mais login interdit jusqu'à verify-otp. */
      emailVerified?: boolean;
    }
  ) {
    const verified = data.emailVerified ?? false;
    console.log('[AuthRepository] Creating user with classId:', data.classId);
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        sex: data.sex,
        campuses: data.campusId ? { connect: [{ id: data.campusId }] } : undefined,
        classId: data.classId,
        schoolId: data.schoolId,
        emailVerified: verified,
        emailVerifiedAt: verified ? new Date() : null,
      },
      include: { 
        campuses: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } }
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
    data: {
      firstName?: string;
      lastName?: string;
      matricule?: string | null;
      numero?: string | null;
      phone?: string | null;
    }
  ): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  },

  async updateAvatarPath(userId: string, avatarPath: string | null): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { avatarPath },
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
      include: { 
        user: { 
          include: { 
            campuses: { select: { id: true, name: true } },
            class: { select: { id: true, name: true } }
          } 
        } 
      },
    });
  },

  async deleteRefreshToken(token: string) {
    return prisma.refreshToken.deleteMany({
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
      include: { 
        user: { 
          include: { 
            campuses: { select: { id: true, name: true } },
            class: { select: { id: true, name: true } }
          } 
        } 
      },
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
      include: { 
        user: { 
          include: { 
            campuses: { select: { id: true, name: true } },
            class: { select: { id: true, name: true } }
          } 
        } 
      },
    });
  },

  async markPasswordResetUsed(id: string) {
    return prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  },
};
