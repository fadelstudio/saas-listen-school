import bcrypt from 'bcrypt';
import { prisma } from '../../core/database/prisma';
import { NotFoundError } from '../../core/errors/AppError';
import { CreateSchoolInput } from './saas.schema';
import { ConflictError } from '../../core/errors/AppError';
import { Role } from '@prisma/client';
import { Prisma } from '@prisma/client';

const SALT_ROUNDS = 12;

export const saasService = {
  async createSchool(input: CreateSchoolInput) {
    // 1. Check if email or matricule exists
    const orConditions: Prisma.UserWhereInput[] = [
      { email: input.adminEmail },
      ...(input.matricule ? [{ matricule: input.matricule }] : []),
    ];

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: orConditions,
      }
    });

    if (existingUser) {
      throw new ConflictError('Admin with this email or matricule already exists');
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(input.adminPassword, SALT_ROUNDS);

    // 3. Transaction to create Campus + Admin
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const campus = await tx.campus.create({
        data: {
          name: input.name,
          location: input.location,
        }
      });

      const user = await tx.user.create({
        data: {
          email: input.adminEmail,
          passwordHash,
          firstName: input.adminFirstName,
          lastName: input.adminLastName,
          role: Role.ADMIN,
          campusId: campus.id,
          matricule: input.matricule,
          isActive: true
        }
      });

      return { campus, user: { id: user.id, email: user.email, role: user.role } };
    });
  },

  async listSchools() {
    return prisma.campus.findMany({
      include: {
        _count: {
          select: {
            users: true,
            classes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async getSchoolById(id: string) {
    const campus = await prisma.campus.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            classes: true,
            professors: true
          }
        }
      }
    });
    if (!campus) throw new NotFoundError('School/Campus');
    return campus;
  },

  async updateSchool(id: string, data: { name?: string; location?: string }) {
    return prisma.campus.update({
      where: { id },
      data
    });
  }
};
