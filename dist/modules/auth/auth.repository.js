"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRepository = void 0;
const prisma_1 = require("../../core/database/prisma");
const logger_1 = require("../../utils/logger");
exports.authRepository = {
    async findByEmail(email, schoolId) {
        return prisma_1.prisma.user.findFirst({
            where: { email, schoolId },
            include: {
                school: { select: { slug: true } },
                campuses: { select: { id: true, name: true } },
                class: { select: { id: true, name: true } }
            },
        });
    },
    async findByIdentifier(identifier, schoolId) {
        return prisma_1.prisma.user.findFirst({
            where: {
                schoolId,
                OR: [
                    { email: identifier },
                    { matricule: identifier }
                ]
            },
            include: {
                school: { select: { slug: true } },
                campuses: { select: { id: true, name: true } },
                class: { select: { id: true, name: true } }
            },
        });
    },
    /** Pour message d’erreur login : compte connu mais mauvais tenant (x-school-slug). */
    async findByIdentifierGlobal(identifier) {
        return prisma_1.prisma.user.findFirst({
            where: {
                OR: [{ email: identifier }, { matricule: identifier }],
            },
            include: { school: { select: { slug: true, name: true } } },
        });
    },
    async findByGoogleId(googleId) {
        return prisma_1.prisma.user.findUnique({
            where: { googleId },
            include: {
                school: { select: { slug: true } },
                campuses: { select: { id: true, name: true } },
                class: { select: { id: true, name: true } },
            },
        });
    },
    /** Email est unique globalement sur `users` (recherche insensible à la casse). */
    async findByEmailGlobal(email) {
        return prisma_1.prisma.user.findFirst({
            where: { email: { equals: email.trim(), mode: 'insensitive' } },
            include: {
                school: { select: { slug: true } },
                campuses: { select: { id: true, name: true } },
                class: { select: { id: true, name: true } },
            },
        });
    },
    async createStudentFromGoogle(data) {
        logger_1.logger.info('[AuthRepository] Creating Google student user', { email: data.email, classId: data.classId });
        return prisma_1.prisma.user.create({
            data: {
                email: data.email,
                passwordHash: null,
                googleId: data.googleId,
                firstName: data.firstName,
                lastName: data.lastName,
                sex: 'UNDEFINED',
                role: 'STUDENT',
                campuses: { connect: [{ id: data.campusId }] },
                classId: data.classId,
                schoolId: data.schoolId,
                emailVerified: data.emailVerified,
                emailVerifiedAt: data.emailVerified ? new Date() : null,
            },
            include: {
                campuses: { select: { id: true, name: true } },
                class: { select: { id: true, name: true } },
            },
        });
    },
    async updateStudentClassAndCampus(userId, classId, campusId) {
        return prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                classId,
                campuses: { set: [{ id: campusId }] },
            },
            include: {
                campuses: { select: { id: true, name: true } },
                class: { select: { id: true, name: true } },
            },
        });
    },
    async findById(id) {
        return prisma_1.prisma.user.findUnique({
            where: { id },
            include: {
                campuses: { select: { id: true, name: true } },
                class: { select: { id: true, name: true } }
            },
        });
    },
    async create(data) {
        const verified = data.emailVerified ?? false;
        logger_1.logger.info('[AuthRepository] Creating user', { classId: data.classId, email: data.email });
        return prisma_1.prisma.user.create({
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
    async updatePassword(userId, passwordHash) {
        return prisma_1.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
    },
    async updateProfile(userId, data) {
        return prisma_1.prisma.user.update({
            where: { id: userId },
            data,
        });
    },
    async updateAvatarPath(userId, avatarPath) {
        return prisma_1.prisma.user.update({
            where: { id: userId },
            data: { avatarPath },
        });
    },
    // ─── Refresh Tokens ─────────────────────────────────────────────────────────
    async createRefreshToken(userId, token, expiresAt) {
        return prisma_1.prisma.refreshToken.create({
            data: {
                userId,
                token,
                expiresAt,
            },
        });
    },
    async findRefreshToken(token) {
        return prisma_1.prisma.refreshToken.findUnique({
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
    async deleteRefreshToken(token) {
        return prisma_1.prisma.refreshToken.deleteMany({
            where: { token },
        });
    },
    async deleteAllUserRefreshTokens(userId) {
        return prisma_1.prisma.refreshToken.deleteMany({
            where: { userId },
        });
    },
    async setActive(userId, isActive) {
        return prisma_1.prisma.user.update({
            where: { id: userId },
            data: { isActive },
        });
    },
    async deleteLoginChallengesForUser(userId) {
        return prisma_1.prisma.loginOtpChallenge.deleteMany({ where: { userId } });
    },
    async createLoginOtpChallenge(userId, otpHash, expiresAt) {
        return prisma_1.prisma.loginOtpChallenge.create({
            data: { userId, otpHash, expiresAt },
        });
    },
    async findLoginOtpChallengeById(id) {
        return prisma_1.prisma.loginOtpChallenge.findUnique({
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
    async incrementLoginOtpAttempts(id) {
        return prisma_1.prisma.loginOtpChallenge.update({
            where: { id },
            data: { attempts: { increment: 1 } },
        });
    },
    async deleteLoginOtpChallenge(id) {
        return prisma_1.prisma.loginOtpChallenge.delete({ where: { id } }).catch(() => { });
    },
    async deletePasswordResetTokensForUser(userId) {
        return prisma_1.prisma.passwordResetToken.deleteMany({ where: { userId } });
    },
    async createPasswordResetToken(userId, tokenHash, expiresAt) {
        return prisma_1.prisma.passwordResetToken.create({
            data: { userId, tokenHash, expiresAt },
        });
    },
    async findPasswordResetByTokenHash(tokenHash) {
        return prisma_1.prisma.passwordResetToken.findUnique({
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
    async markPasswordResetUsed(id) {
        return prisma_1.prisma.passwordResetToken.update({
            where: { id },
            data: { usedAt: new Date() },
        });
    },
};
//# sourceMappingURL=auth.repository.js.map