import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { prisma } from '../../core/database/prisma';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
} from '../../core/errors/AppError';
import { parsePagination, buildPaginated } from '../../utils/pagination';

const SALT_ROUNDS = 12;

const ASSIGNABLE: Role[] = [Role.MANAGER, Role.AGENT, Role.VIEWER, Role.STUDENT];

async function assertCampusAdmin(adminUserId: string) {
  const admin = await prisma.user.findUnique({ where: { id: adminUserId } });
  if (!admin || admin.role !== Role.ADMIN || !admin.campusId) {
    throw new ForbiddenError('Only school administrators can manage users');
  }
  return { ...admin, campusId: admin.campusId as string };
}

export const schoolUsersService = {
  async create(
    adminUserId: string,
    input: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: 'MANAGER' | 'AGENT' | 'VIEWER' | 'STUDENT';
      matricule?: string;
      classId?: string;
    }
  ) {
    const admin = await assertCampusAdmin(adminUserId);
    const role = input.role as Role;
    if (!ASSIGNABLE.includes(role)) {
      throw new ForbiddenError('Cannot assign this role');
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: input.email }, ...(input.matricule ? [{ matricule: input.matricule }] : [])],
      },
    });
    if (existing) {
      throw new ConflictError('Email or matricule already in use');
    }

    if (input.classId) {
      const cls = await prisma.class.findFirst({
        where: { id: input.classId, campusId: admin.campusId },
      });
      if (!cls) throw new BadRequestError('Class does not belong to your campus');
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role,
        campusId: admin.campusId,
        classId: input.classId ?? null,
        matricule: input.matricule ?? null,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      campusId: user.campusId,
      classId: user.classId,
      matricule: user.matricule,
      isActive: user.isActive,
    };
  },

  async list(adminUserId: string, query: Record<string, unknown>) {
    const admin = await assertCampusAdmin(adminUserId);
    const pagination = parsePagination(query);
    const where = {
      campusId: admin.campusId,
      role: { not: Role.SUPERADMIN },
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          matricule: true,
          classId: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return buildPaginated(items, total, pagination.page, pagination.limit);
  },

  async update(
    adminUserId: string,
    targetId: string,
    input: {
      role?: 'MANAGER' | 'AGENT' | 'VIEWER' | 'STUDENT';
      isActive?: boolean;
      classId?: string | null;
    }
  ) {
    const admin = await assertCampusAdmin(adminUserId);
    if (targetId === adminUserId) {
      throw new ForbiddenError('Use profile or account settings to change your own account');
    }

    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target || target.campusId !== admin.campusId) {
      throw new NotFoundError('User');
    }
    if (target.role === Role.SUPERADMIN) {
      throw new ForbiddenError('Cannot modify super administrator');
    }

    if (input.role) {
      const r = input.role as Role;
      if (!ASSIGNABLE.includes(r)) {
        throw new ForbiddenError('Cannot assign this role');
      }
    }

    if (input.classId) {
      const cls = await prisma.class.findFirst({
        where: { id: input.classId, campusId: admin.campusId },
      });
      if (!cls) throw new BadRequestError('Class does not belong to your campus');
    }

    return prisma.user.update({
      where: { id: targetId },
      data: {
        ...(input.role !== undefined && { role: input.role as Role }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.classId !== undefined && { classId: input.classId }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        matricule: true,
        classId: true,
      },
    });
  },

  async getById(adminUserId: string, targetId: string) {
    const admin = await assertCampusAdmin(adminUserId);
    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target || target.campusId !== admin.campusId) {
      throw new NotFoundError('User');
    }
    return target;
  },

  async delete(adminUserId: string, targetId: string) {
    const admin = await assertCampusAdmin(adminUserId);
    if (targetId === adminUserId) {
      throw new ForbiddenError('You cannot delete yourself');
    }

    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target || target.campusId !== admin.campusId) {
      throw new NotFoundError('User');
    }
    
    // Deactivate instead of hard delete to preserve history?
    // User requested "delete", let's follow standard pattern
    return prisma.user.delete({ where: { id: targetId } });
  }
};
