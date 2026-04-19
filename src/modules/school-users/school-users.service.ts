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
import { env } from '../../core/config/env';
import { uploadsService } from '../uploads/uploads.service';

const SALT_ROUNDS = 12;

const ASSIGNABLE: Role[] = [Role.MANAGER, Role.AGENT, Role.VIEWER, Role.STUDENT];

function enrichSchoolUser<T extends { campusId: string | null }>(row: T) {
  return {
    ...row,
    campusAccess: row.campusId == null ? ('ALL' as const) : ('RESTRICTED' as const),
    campusScopeLabel: row.campusId == null ? 'TOUS' : null,
  };
}

async function enrichSchoolUserWithAvatar<T extends { campusId: string | null; avatarPath?: string | null }>(
  row: T,
) {
  const base = enrichSchoolUser(row);
  const avatarUrl = await uploadsService.getSignedUrlForPath(row.avatarPath ?? null);
  return { ...base, avatarUrl };
}

/** Affectation campus : classe > campus explicite > null (= tous les campus de l’école). */
async function resolveCampusForNewUser(
  admin: { schoolId: string | null; campusId: string | null },
  input: { campusId?: string; classId?: string }
): Promise<string | null> {
  const schoolId = admin.schoolId!;
  if (input.classId) {
    const cls = await prisma.class.findFirst({
      where: {
        id: input.classId,
        campus: { schoolId },
        ...(admin.campusId ? { campusId: admin.campusId } : {}),
      },
    });
    if (!cls) throw new BadRequestError('Class does not belong to your scope');
    return cls.campusId;
  }
  if (input.campusId) {
    const c = await prisma.campus.findFirst({
      where: { id: input.campusId, schoolId },
    });
    if (!c) throw new BadRequestError('Campus does not belong to this school');
    return c.id;
  }
  return null;
}

async function assertCampusAdmin(adminUserId: string) {
  const admin = await prisma.user.findUnique({ where: { id: adminUserId } });
  if (!admin || !([Role.ADMIN, Role.SUPERADMIN] as Role[]).includes(admin.role)) {
    throw new ForbiddenError('Only administrators can manage users');
  }
  return admin;
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
      numero?: string;
      phone?: string;
      campusId?: string;
      classId?: string;
    }
  ) {
    const admin = await assertCampusAdmin(adminUserId);
    const role = input.role as Role;
    if (!ASSIGNABLE.includes(role)) {
      throw new ForbiddenError('Cannot assign this role');
    }

    if (role === Role.STUDENT && !input.classId) {
      throw new BadRequestError('Students must be assigned to a class');
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: input.email }, ...(input.matricule ? [{ matricule: input.matricule }] : [])],
      },
    });
    if (existing) {
      throw new ConflictError('Email or matricule already in use');
    }

    const resolvedCampusId = await resolveCampusForNewUser(admin, {
      campusId: input.campusId,
      classId: input.classId,
    });

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role,
        schoolId: admin.schoolId,
        campusId: resolvedCampusId,
        classId: input.classId ?? null,
        matricule: input.matricule ?? null,
        numero: input.numero?.trim() || null,
        phone: input.phone?.trim() || null,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    return enrichSchoolUserWithAvatar({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      campusId: user.campusId,
      classId: user.classId,
      matricule: user.matricule,
      numero: user.numero,
      phone: user.phone,
      avatarPath: user.avatarPath,
      isActive: user.isActive,
    });
  },

  async list(adminUserId: string, query: Record<string, unknown>) {
    const admin = await assertCampusAdmin(adminUserId);
    const pagination = parsePagination(query);

    const { role, campusId, classId, search, isActive } = query;

    const where: any = {
      // Data isolation by school
      schoolId: admin.schoolId,
    };

    // Campus filtering : ADMIN sans campus = toute l’école ; sinon scope campus
    if (admin.role === Role.ADMIN) {
      if (admin.campusId) {
        where.campusId = admin.campusId as string;
      }
    } else if (campusId) {
      where.campusId = campusId as string;
    }

    // Filter by role(s)
    if (role) {
      where.role = role as Role;
    } else {
      // Default: don't show SuperAdmins to others
      where.role = { not: Role.SUPERADMIN };
    }

    // Filter by class
    if (classId) {
      where.classId = classId as string;
    }

    // Filter by activity
    if (isActive !== undefined) {
      where.isActive = isActive === 'true' || isActive === true;
    }

    // Search by name, email or matricule
    if (search) {
      const s = search as string;
      where.OR = [
        { email: { contains: s, mode: 'insensitive' } },
        { firstName: { contains: s, mode: 'insensitive' } },
        { lastName: { contains: s, mode: 'insensitive' } },
        { matricule: { contains: s, mode: 'insensitive' } },
        { numero: { contains: s, mode: 'insensitive' } },
      ];
    }

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
          numero: true,
          phone: true,
          classId: true,
          campusId: true,
          avatarPath: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    const enriched = await Promise.all(items.map((u) => enrichSchoolUserWithAvatar(u)));

    return buildPaginated(enriched, total, pagination.page, pagination.limit);
  },

  async listStaff(adminUserId: string, query: Record<string, unknown>) {
    const admin = await assertCampusAdmin(adminUserId);
    // Personnel management restricted to ADMIN and SUPERADMIN
    if (!([Role.SUPERADMIN, Role.ADMIN] as Role[]).includes(admin.role)) {
      throw new ForbiddenError('Only administrators can manage the staff');
    }

    return this.list(adminUserId, {
      ...query,
      role: query.role ?? { in: [Role.ADMIN, Role.MANAGER, Role.AGENT, Role.VIEWER] },
    });
  },

  async listStudents(adminUserId: string, query: Record<string, unknown>) {
    return this.list(adminUserId, {
      ...query,
      role: Role.STUDENT,
    });
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
    if (!target) throw new NotFoundError('User');

    // Access control
    if (admin.role !== Role.SUPERADMIN && target.schoolId !== admin.schoolId) {
      throw new ForbiddenError('Access denied: different school');
    }
    if (admin.role === Role.ADMIN && admin.campusId && target.campusId !== admin.campusId) {
      throw new ForbiddenError('Access denied: different campus');
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
        where: {
          id: input.classId,
          campus: { schoolId: admin.schoolId! },
          ...(admin.campusId ? { campusId: admin.campusId as string } : {}),
        },
      });
      if (!cls) throw new BadRequestError('Class does not belong to your scope');
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
    const target = await prisma.user.findUnique({
      where: { id: targetId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        matricule: true,
        numero: true,
        phone: true,
        classId: true,
        campusId: true,
        schoolId: true,
        avatarPath: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
      },
    });
    if (!target) throw new NotFoundError('User');

    if (admin.role !== Role.SUPERADMIN && target.schoolId !== admin.schoolId) {
      throw new ForbiddenError('Access denied');
    }

    return enrichSchoolUserWithAvatar(target);
  },

  async resetPasswordToDefault(adminUserId: string, targetId: string) {
    const admin = await assertCampusAdmin(adminUserId);
    if (targetId === adminUserId) {
      throw new ForbiddenError('Use change-password to update your own password');
    }

    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target) throw new NotFoundError('User');

    if (admin.role !== Role.SUPERADMIN && target.schoolId !== admin.schoolId) {
      throw new ForbiddenError('Access denied: different school');
    }
    if (admin.role === Role.ADMIN && admin.campusId && target.campusId !== admin.campusId) {
      throw new ForbiddenError('Access denied: different campus');
    }
    if (target.role === Role.SUPERADMIN) {
      throw new ForbiddenError('Cannot reset super administrator password');
    }

    const passwordHash = await bcrypt.hash(env.DEFAULT_PASSWORD_RESET, SALT_ROUNDS);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: targetId },
        data: { passwordHash },
      }),
      prisma.refreshToken.deleteMany({ where: { userId: targetId } }),
      prisma.passwordResetToken.deleteMany({ where: { userId: targetId } }),
      prisma.loginOtpChallenge.deleteMany({ where: { userId: targetId } }),
    ]);

    return {
      message:
        'Password reset. The user must sign in with the default password configured for the server (DEFAULT_PASSWORD_RESET).',
    };
  },

  async delete(adminUserId: string, targetId: string) {
    const admin = await assertCampusAdmin(adminUserId);
    if (targetId === adminUserId) {
      throw new ForbiddenError('You cannot delete yourself');
    }

    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target) throw new NotFoundError('User');

    if (admin.role !== Role.SUPERADMIN && target.schoolId !== admin.schoolId) {
      throw new ForbiddenError('Access denied: different school');
    }
    if (admin.role === Role.ADMIN && admin.campusId && target.campusId !== admin.campusId) {
       throw new ForbiddenError('Access denied: different campus');
    }
    
    // Deactivate instead of hard delete to preserve history?
    // User requested "delete", let's follow standard pattern
    return prisma.user.delete({ where: { id: targetId } });
  }
};
