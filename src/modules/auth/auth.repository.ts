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

  async setActive(userId: string, isActive: boolean): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
  },
};
