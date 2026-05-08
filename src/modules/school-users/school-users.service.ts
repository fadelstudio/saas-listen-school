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
import { auditService } from '../audit/audit.service';

const SALT_ROUNDS = 12;

const ASSIGNABLE: Role[] = [Role.ADMIN, Role.MANAGER, Role.AGENT, Role.VIEWER, Role.STUDENT];

function enrichSchoolUser<T extends { campuses?: { id: string }[] }>(row: T) {
  const isGlobal = !row.campuses || row.campuses.length === 0;
  return {
    ...row,
    campusAccess: isGlobal ? ('ALL' as const) : ('RESTRICTED' as const),
    campusScopeLabel: isGlobal ? 'TOUS' : null,
  };
}

async function enrichSchoolUserWithAvatar<T extends { campuses?: { id: string }[]; avatarPath?: string | null }>(
  row: T,
) {
  const base = enrichSchoolUser(row);
  const avatarUrl = await uploadsService.getSignedUrlForPath(row.avatarPath ?? null);
  return { ...base, avatarUrl };
}

/** Affectation campus : classe > campus explicite > null (= tous les campus de l’école). */
async function resolveCampusesForUser(
  admin: { schoolId: string | null; campuses: { id: string }[] },
  input: { campusIds?: string[]; classId?: string },
  role: Role
): Promise<string[]> {
  if (role === Role.ADMIN || role === Role.SUPERADMIN) return [];

  const schoolId = admin.schoolId!;
  if (input.classId) {
    const cls = await prisma.class.findFirst({
      where: {
        id: input.classId,
        campus: { schoolId },
        // Restreindre au scope de l'admin si non global
        ...(admin.campuses.length > 0 ? { campusId: { in: admin.campuses.map(c => c.id) } } : {}),
      },
    });
    if (!cls) throw new BadRequestError('Class does not belong to your scope');
    return [cls.campusId];
  }

  if (input.campusIds && input.campusIds.length > 0) {
    const count = await prisma.campus.count({
      where: { 
        id: { in: input.campusIds }, 
        schoolId,
        // Restreindre au scope de l'admin si non global
        ...(admin.campuses.length > 0 ? { id: { in: admin.campuses.map(c => c.id) } } : {}),
      },
    });
    if (count !== input.campusIds.length) {
      throw new BadRequestError('One or more campuses are invalid or out of scope');
    }
    return input.campusIds;
  }
  return [];
}

async function assertStaffAccess(adminUserId: string, requireWrite = false) {
  const admin = await prisma.user.findUnique({ 
    where: { id: adminUserId },
    include: { campuses: { select: { id: true } } }
  });
  
  if (!admin) throw new ForbiddenError('User not found');
  
  const staffRoles: Role[] = [Role.ADMIN, Role.MANAGER, Role.AGENT, Role.VIEWER];
  if (!staffRoles.includes(admin.role)) {
    throw new ForbiddenError('Insufficient permissions');
  }

  if (requireWrite && admin.role === Role.VIEWER) {
    throw new ForbiddenError('VIEWER role is read-only');
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
      role: 'ADMIN' | 'MANAGER' | 'AGENT' | 'VIEWER' | 'STUDENT';
      matricule?: string;
      numero?: string;
      phone?: string;
      bio?: string;
      address?: string;
      campusIds?: string[];
      classId?: string;
    }
  ) {
    const admin = await assertStaffAccess(adminUserId, true);
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

    const resolvedCampusIds = await resolveCampusesForUser(admin, {
      campusIds: input.campusIds,
      classId: input.classId,
    }, role);

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role,
        schoolId: admin.schoolId,
        campuses: { connect: resolvedCampusIds.map(id => ({ id })) },
        classId: input.classId ?? null,
        matricule: input.matricule ?? null,
        numero: input.numero?.trim() || null,
        phone: input.phone?.trim() || null,
        bio: input.bio?.trim() || null,
        address: input.address?.trim() || null,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
      include: { campuses: { select: { id: true } } },
    });

    const enriched = await enrichSchoolUserWithAvatar({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      campuses: user.campuses,
      classId: user.classId,
      matricule: user.matricule,
      numero: user.numero,
      phone: user.phone,
      bio: user.bio,
      address: user.address,
      avatarPath: user.avatarPath,
      isActive: user.isActive,
    });

    if (admin.schoolId) {
      await auditService.log({
        schoolId: admin.schoolId,
        userId: adminUserId,
        action: 'CREATE_USER',
        entity: 'User',
        entityId: user.id,
        details: { email: user.email, role: user.role }
      });
    }

    return enriched;
  },

  async list(adminUserId: string, query: Record<string, unknown>) {
    const admin = await assertStaffAccess(adminUserId);
    const pagination = parsePagination(query);

    const { role, campusId, classId, search, isActive } = query;
    const andParts: any[] = [{ schoolId: admin.schoolId }];
    
    // Campus filtering : ADMIN/MANAGER/AGENT/VIEWER restreints par leurs campus
    if (admin.role !== Role.SUPERADMIN && admin.campuses.length > 0) {
      const allowedIds = admin.campuses.map(c => c.id);
      andParts.push({
        OR: [
          { campuses: { some: { id: { in: allowedIds } } } },
          { class: { campusId: { in: allowedIds } } }
        ]
      });
    } else if (campusId) {
      andParts.push({ campuses: { some: { id: campusId as string } } });
    }

    // Filter by role(s)
    if (role) {
      andParts.push({ role: role as Role });
    } else {
      // Default: don't show SuperAdmins to others
      andParts.push({ role: { not: Role.SUPERADMIN } });
    }

    // Filter by class
    if (classId) {
      andParts.push({ classId: classId as string });
    }

    // Filter by activity
    if (isActive !== undefined) {
      andParts.push({ isActive: isActive === 'true' || isActive === true });
    }

    // Search by name, email or matricule
    if (search) {
      const s = search as string;
      andParts.push({
        OR: [
          { email: { contains: s, mode: 'insensitive' } },
          { firstName: { contains: s, mode: 'insensitive' } },
          { lastName: { contains: s, mode: 'insensitive' } },
          { matricule: { contains: s, mode: 'insensitive' } },
          { numero: { contains: s, mode: 'insensitive' } },
        ]
      });
    }

    // Global policy: Never return students without a class
    andParts.push({
      NOT: [{ role: Role.STUDENT, classId: null }]
    });

    const where = { AND: andParts };

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
          bio: true,
          address: true,
          classId: true,
          campuses: { select: { id: true } },
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
    const admin = await assertStaffAccess(adminUserId);
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
      role?: 'ADMIN' | 'MANAGER' | 'AGENT' | 'VIEWER' | 'STUDENT';
      isActive?: boolean;
      classId?: string | null;
      campusIds?: string[];
      firstName?: string;
      lastName?: string;
      matricule?: string | null;
      numero?: string | null;
      phone?: string | null;
      bio?: string | null;
      address?: string | null;
      email?: string;
    }
  ) {
    const admin = await assertStaffAccess(adminUserId, true);
    
    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target) throw new NotFoundError('User');
    
    if (targetId === adminUserId && input.role && input.role !== target.role) {
      throw new ForbiddenError('You cannot change your own role');
    }
    if (targetId === adminUserId && input.isActive !== undefined && input.isActive !== target.isActive) {
      throw new ForbiddenError('You cannot deactivate yourself');
    }

    // Access control
    if (admin.role !== Role.SUPERADMIN && target.schoolId !== admin.schoolId) {
      throw new ForbiddenError('Access denied: different school');
    }
    if (([Role.ADMIN, Role.MANAGER, Role.AGENT] as Role[]).includes(admin.role) && admin.campuses.length > 0) {
      const allowedIds = admin.campuses.map(c => c.id);
      const isMyCampus = await prisma.user.findFirst({
        where: { 
          id: targetId,
          OR: [
            { campuses: { some: { id: { in: allowedIds } } } },
            { class: { campusId: { in: allowedIds } } }
          ]
        }
      });
      if (!isMyCampus) throw new ForbiddenError('Access denied: user outside your campus scope');
    }
    if (target.role === Role.SUPERADMIN) {
      throw new ForbiddenError('Cannot modify super administrator');
    }

    if (input.email && input.email !== target.email) {
      const emailTaken = await prisma.user.findFirst({
        where: { email: input.email },
      });
      if (emailTaken) throw new ConflictError('Email already in use');
    }

    if (input.matricule && input.matricule !== target.matricule) {
      const matriculeTaken = await prisma.user.findFirst({
        where: { matricule: input.matricule, schoolId: admin.schoolId },
      });
      if (matriculeTaken) throw new ConflictError('Matricule already in use');
    }

    if (input.role) {
      const r = input.role as Role;
      if (!ASSIGNABLE.includes(r)) {
        throw new ForbiddenError('Cannot assign this role');
      }
    }

    let resolvedCampusIds = input.campusIds;

    if (input.classId === null && (input.role === Role.STUDENT || target.role === Role.STUDENT)) {
      throw new BadRequestError('Students must be assigned to a class');
    }

    if (input.classId) {
      const cls = await prisma.class.findFirst({
        where: {
          id: input.classId,
          campus: { schoolId: admin.schoolId! },
          ...(admin.campuses.length > 0 ? { campusId: { in: admin.campuses.map(c => c.id) } } : {}),
        },
      });
      if (!cls) throw new BadRequestError('Class does not belong to your scope');
      resolvedCampusIds = [cls.campusId];
    }

    const updated = await prisma.user.update({
      where: { id: targetId },
      data: {
        ...(input.role !== undefined && { role: input.role as Role }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.classId !== undefined && { classId: input.classId }),
        ...(input.firstName !== undefined && { firstName: input.firstName }),
        ...(input.lastName !== undefined && { lastName: input.lastName }),
        ...(input.matricule !== undefined && { matricule: input.matricule }),
        ...(input.numero !== undefined && { numero: input.numero }),
        ...(input.phone !== undefined && { phone: input.phone }),
        ...(input.bio !== undefined && { bio: input.bio }),
        ...(input.address !== undefined && { address: input.address }),
        ...(input.email !== undefined && { email: input.email }),
        ...(resolvedCampusIds !== undefined && { campuses: { set: resolvedCampusIds.map(id => ({ id })) } }),
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
        campuses: { select: { id: true } },
      },
    });

    if (admin.schoolId) {
      await auditService.log({
        schoolId: admin.schoolId,
        userId: adminUserId,
        action: 'UPDATE_USER',
        entity: 'User',
        entityId: targetId,
        details: { updatedFields: Object.keys(input) }
      });
    }

    return updated;
  },

  async getById(adminUserId: string, targetId: string) {
    const admin = await assertStaffAccess(adminUserId);
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
        bio: true,
        address: true,
        classId: true,
        campuses: { select: { id: true } },
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

    if (([Role.ADMIN, Role.MANAGER, Role.AGENT] as Role[]).includes(admin.role) && admin.campuses.length > 0) {
       const allowedIds = admin.campuses.map(c => c.id);
       const isMyCampus = await prisma.user.findFirst({
         where: { 
           id: targetId,
           OR: [
             { campuses: { some: { id: { in: allowedIds } } } },
             { class: { campusId: { in: allowedIds } } }
           ]
         }
       });
       if (!isMyCampus) throw new ForbiddenError('Access denied: user outside your campus scope');
    }

    return enrichSchoolUserWithAvatar(target);
  },

  async resetPasswordToDefault(adminUserId: string, targetId: string) {
    const admin = await assertStaffAccess(adminUserId, true);
    if (targetId === adminUserId) {
      throw new ForbiddenError('Use change-password to update your own password');
    }

    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target) throw new NotFoundError('User');

    if (admin.role !== Role.SUPERADMIN && target.schoolId !== admin.schoolId) {
      throw new ForbiddenError('Access denied: different school');
    }
    if (([Role.ADMIN, Role.MANAGER, Role.AGENT] as Role[]).includes(admin.role) && admin.campuses.length > 0) {
      const allowedIds = admin.campuses.map(c => c.id);
      const isMyCampus = await prisma.user.findFirst({
        where: { 
          id: targetId,
          OR: [
            { campuses: { some: { id: { in: allowedIds } } } },
            { class: { campusId: { in: allowedIds } } }
          ]
        }
      });
      if (!isMyCampus) throw new ForbiddenError('Access denied: user outside your campus scope');
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

    // Send reset email in background (User can still choose their own password)
    try {
      const { authService } = await import('../auth/auth.service');
      await authService.forgotPassword({ email: target.email }, target.schoolId!);
    } catch (err) {
      console.warn('[SchoolUsersService] Failed to send reset email:', err);
    }

    if (admin.schoolId) {
      await auditService.log({
        schoolId: admin.schoolId,
        userId: adminUserId,
        action: 'RESET_PASSWORD',
        entity: 'User',
        entityId: targetId,
      });
    }

    return {
      message:
        'Password reset. The user must sign in with the default password configured for the server (DEFAULT_PASSWORD_RESET).',
    };
  },

  async delete(adminUserId: string, targetId: string) {
    const admin = await assertStaffAccess(adminUserId, true);
    if (targetId === adminUserId) {
      throw new ForbiddenError('You cannot delete yourself');
    }

    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target) throw new NotFoundError('User');

    if (admin.role !== Role.SUPERADMIN && target.schoolId !== admin.schoolId) {
      throw new ForbiddenError('Access denied: different school');
    }
    if (([Role.ADMIN, Role.MANAGER, Role.AGENT] as Role[]).includes(admin.role) && admin.campuses.length > 0) {
      const allowedIds = admin.campuses.map(c => c.id);
      const isMyCampus = await prisma.user.findFirst({
        where: { 
          id: targetId,
          OR: [
            { campuses: { some: { id: { in: allowedIds } } } },
            { class: { campusId: { in: allowedIds } } }
          ]
        }
      });
      if (!isMyCampus) throw new ForbiddenError('Access denied: user outside your campus scope');
    }
    
    // Deactivate instead of hard delete to preserve history?
    // User requested "delete", let's follow standard pattern
    const result = await prisma.user.delete({ where: { id: targetId } });

    if (admin.schoolId) {
      await auditService.log({
        schoolId: admin.schoolId,
        userId: adminUserId,
        action: 'DELETE_USER',
        entity: 'User',
        entityId: targetId,
      });
    }

    return result;
  }
};
