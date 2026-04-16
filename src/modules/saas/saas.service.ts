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

    // 3. Transaction to create School + Campus + Admin + Settings
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const school = await tx.school.create({
        data: {
          name: input.name,
        }
      });

      const campus = await tx.campus.create({
        data: {
          schoolId: school.id,
          name: `${input.name} - Main Campus`,
          location: input.location,
        }
      });

      await tx.systemSettings.create({
        data: {
          schoolId: school.id,
          schoolName: input.name,
          aiEnabled: true,
          aiConfigs: [],
        }
      });

      const user = await tx.user.create({
        data: {
          email: input.adminEmail,
          passwordHash,
          firstName: input.adminFirstName,
          lastName: input.adminLastName,
          role: Role.ADMIN,
          schoolId: school.id,
          campusId: campus.id,
          matricule: input.matricule,
          isActive: true
        }
      });

      return { school, campus, user: { id: user.id, email: user.email, role: user.role } };
    });
  },

  async listSchools() {
    return prisma.school.findMany({
      include: {
        campuses: true,
        _count: {
          select: {
            users: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async getSchoolById(id: string) {
    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        campuses: {
          include: {
            _count: {
              select: {
                users: true,
                classes: true,
                professors: true
              }
            }
          }
        },
        settings: true
      }
    });
    if (!school) throw new NotFoundError('School');
    return school;
  },

  async updateSchool(id: string, data: { name?: string; domain?: string; logoUrl?: string }) {
    return prisma.school.update({
      where: { id },
      data
    });
  }
};
