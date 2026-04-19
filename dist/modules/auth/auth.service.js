"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../../core/config/env");
const prisma_1 = require("../../core/database/prisma");
const AppError_1 = require("../../core/errors/AppError");
const auth_repository_1 = require("./auth.repository");
const client_1 = require("@prisma/client");
const mail_service_1 = require("../../core/email/mail.service");
const uploads_service_1 = require("../uploads/uploads.service");
const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;
async function isRegisterOtpRequiredForSchool(schoolId) {
    // 1) ENV can force OTP for registration globally
    if (env_1.env.LOGIN_OTP_ENABLED)
        return true;
    // 2) Per-school DB setting when available; fallback to first row for legacy single-school DBs
    const settings = schoolId
        ? await prisma_1.prisma.systemSettings.findUnique({ where: { schoolId } }).catch(() => null)
        : null;
    if (settings)
        return settings.authOtpRequired ?? false;
    const first = await prisma_1.prisma.systemSettings.findFirst();
    return first?.authOtpRequired ?? false;
}
function hashOtp(otp) {
    return crypto_1.default.createHash('sha256').update(`${otp}:${env_1.env.JWT_SECRET}`).digest('hex');
}
function hashResetToken(token) {
    return crypto_1.default.createHash('sha256').update(`${token}:${env_1.env.JWT_SECRET}`).digest('hex');
}
function generateNumericOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
}
function toSafeUser(user) {
    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        matricule: user.matricule,
        numero: user.numero,
        phone: user.phone,
        campusIds: user.campuses?.map((c) => c.id) || [],
        classId: user.classId,
        schoolId: user.schoolId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}
async function toSafeUserWithAvatar(user) {
    const base = toSafeUser(user);
    const avatarUrl = await uploads_service_1.uploadsService.getSignedUrlForPath(user.avatarPath);
    return { ...base, avatarUrl };
}
async function generateTokens(user) {
    let resolvedSchoolId = user.schoolId;
    if (user.role !== client_1.Role.SUPERADMIN && !resolvedSchoolId && user.campusIds.length > 0) {
        const campus = await prisma_1.prisma.campus.findUnique({
            where: { id: user.campusIds[0] },
            select: { schoolId: true },
        });
        resolvedSchoolId = campus?.schoolId || null;
    }
    if (user.role !== client_1.Role.SUPERADMIN && !resolvedSchoolId) {
        throw new AppError_1.UnauthorizedError('Account is missing school assignment. Contact an administrator.');
    }
    const payload = {
        userId: user.id,
        role: user.role,
    };
    if (resolvedSchoolId != null)
        payload.schoolId = resolvedSchoolId;
    if (user.campusIds.length > 0)
        payload.campusIds = user.campusIds;
    if (user.classId != null)
        payload.classId = user.classId;
    const accessToken = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshTokenString = crypto_1.default.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
    await auth_repository_1.authRepository.createRefreshToken(user.id, refreshTokenString, expiresAt);
    return { accessToken, refreshToken: refreshTokenString };
}
exports.authService = {
    async register(input, schoolId) {
        const existing = await auth_repository_1.authRepository.findByEmail(input.email, schoolId);
        if (existing) {
            throw new AppError_1.ConflictError('An account with this email already exists');
        }
        const passwordHash = await bcrypt_1.default.hash(input.password, SALT_ROUNDS);
        const otpRequired = await isRegisterOtpRequiredForSchool(schoolId);
        const user = await auth_repository_1.authRepository.create({
            ...input,
            passwordHash,
            schoolId,
            emailVerified: !otpRequired,
        });
        if (!otpRequired) {
            const { accessToken, refreshToken } = await generateTokens({
                id: user.id,
                role: user.role,
                schoolId: user.schoolId,
                campusIds: user.campuses?.map((c) => c.id) || [],
                classId: user.classId,
            });
            return { token: accessToken, refreshToken, user: await toSafeUserWithAvatar(user) };
        }
        return this.sendNewRegisterOtp(user);
    },
    async login(input, schoolId) {
        const identifier = input.email || input.matricule;
        if (!identifier) {
            throw new AppError_1.UnauthorizedError('Email or matricule must be provided');
        }
        const user = await auth_repository_1.authRepository.findByIdentifier(identifier, schoolId);
        if (!user) {
            const globalUser = await auth_repository_1.authRepository.findByIdentifierGlobal(identifier);
            if (globalUser?.schoolId &&
                globalUser.schoolId !== schoolId &&
                globalUser.school?.slug) {
                throw new AppError_1.UnauthorizedError(`Wrong school context: this account is for school "${globalUser.school.slug}". ` +
                    `Call the API with header x-school-slug: ${globalUser.school.slug} (or open /${globalUser.school.slug}/api/... in non-strict mode).`);
            }
            throw new AppError_1.UnauthorizedError('Invalid credentials');
        }
        if (!user.isActive) {
            throw new AppError_1.UnauthorizedError('Account is deactivated. Contact an administrator.');
        }
        if (!user.emailVerified) {
            throw new AppError_1.UnauthorizedError('Email not verified. Use the code sent to your inbox or request a new code from the registration flow.');
        }
        const isValidPassword = await bcrypt_1.default.compare(input.password, user.passwordHash);
        if (!isValidPassword) {
            throw new AppError_1.UnauthorizedError('Invalid email or password');
        }
        const { accessToken, refreshToken } = await generateTokens({
            id: user.id,
            role: user.role,
            schoolId: user.schoolId,
            campusIds: user.campuses?.map((c) => c.id) || [],
            classId: user.classId,
        });
        return { token: accessToken, refreshToken, user: await toSafeUserWithAvatar(user) };
    },
    async sendNewRegisterOtp(user) {
        const otp = generateNumericOtp();
        const otpHash = hashOtp(otp);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
        const challenge = await auth_repository_1.authRepository.createLoginOtpChallenge(user.id, otpHash, expiresAt);
        const otpExpiresMin = Math.floor(OTP_EXPIRY_MS / 60000);
        const siteName = env_1.env.OTP_SITE_NAME || 'AFI-LISTEN';
        const publicUrl = env_1.env.PUBLIC_APP_URL.replace(/\/$/, '');
        const helpUrl = env_1.env.OTP_HELP_URL ? env_1.env.OTP_HELP_URL : publicUrl;
        const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333;">Code de vérification ${siteName}</h2>
        <p>Bonjour,</p>
        <p>Voici votre code de sécurité pour confirmer votre inscription. Ce code est valide pendant ${otpExpiresMin} minutes.</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000; border-radius: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #666; font-size: 14px;">Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email en toute sécurité.</p>
        <p style="color: #666; font-size: 12px;">Besoin d'aide ? ${helpUrl}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} ${siteName}. Tous droits réservés.</p>
      </div>
    `;
        await (0, mail_service_1.sendTransactionalEmail)({
            to: user.email,
            subject: env_1.env.OTP_EMAIL_SUBJECT || `Code de vérification ${siteName}`,
            text: `Votre code de vérification : ${otp}\nIl expire dans ${otpExpiresMin} minutes.\nAide: ${helpUrl}`,
            html,
        }).catch((err) => {
            console.error('Failed to send OTP email:', err);
        });
        return {
            step: 'REGISTER_OTP_REQUIRED',
            challengeId: challenge.id,
            expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
        };
    },
    async verifyRegisterOtp(input, schoolId) {
        const challenge = await auth_repository_1.authRepository.findLoginOtpChallengeById(input.challengeId);
        if (!challenge || challenge.expiresAt < new Date()) {
            if (challenge)
                await auth_repository_1.authRepository.deleteLoginOtpChallenge(challenge.id);
            throw new AppError_1.UnauthorizedError('Invalid or expired OTP challenge');
        }
        if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
            await auth_repository_1.authRepository.deleteLoginOtpChallenge(challenge.id);
            throw new AppError_1.BadRequestError('Too many OTP attempts. Please log in again.');
        }
        const expected = hashOtp(input.otp.trim());
        if (expected !== challenge.otpHash) {
            const updated = await auth_repository_1.authRepository.incrementLoginOtpAttempts(challenge.id);
            if (updated.attempts >= OTP_MAX_ATTEMPTS) {
                await auth_repository_1.authRepository.deleteLoginOtpChallenge(challenge.id);
                await auth_repository_1.authRepository.setActive(challenge.userId, false); // Block account
                throw new AppError_1.BadRequestError('Too many OTP attempts. Your account has been deactivated for security reasons. Contact support.');
            }
            throw new AppError_1.UnauthorizedError(`Invalid OTP code (${OTP_MAX_ATTEMPTS - updated.attempts} attempts remaining)`);
        }
        await auth_repository_1.authRepository.deleteLoginOtpChallenge(challenge.id);
        const user = challenge.user;
        if (user.schoolId !== schoolId) {
            throw new AppError_1.UnauthorizedError('Invalid OTP challenge for this school context');
        }
        const verifiedUser = await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: true, emailVerifiedAt: new Date() },
            include: { campuses: { select: { id: true } } },
        });
        const { accessToken, refreshToken } = await generateTokens({
            id: verifiedUser.id,
            role: verifiedUser.role,
            schoolId: verifiedUser.schoolId,
            campusIds: verifiedUser.campuses?.map((c) => c.id) || [],
            classId: verifiedUser.classId,
        });
        return { token: accessToken, refreshToken, user: await toSafeUserWithAvatar(verifiedUser) };
    },
    async forgotPassword(input, schoolId) {
        const user = await auth_repository_1.authRepository.findByEmail(input.email, schoolId);
        if (!user) {
            return;
        }
        const rawToken = crypto_1.default.randomBytes(32).toString('hex');
        const tokenHash = hashResetToken(rawToken);
        const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);
        await auth_repository_1.authRepository.deletePasswordResetTokensForUser(user.id);
        await auth_repository_1.authRepository.createPasswordResetToken(user.id, tokenHash, expiresAt);
        const resetUrl = `${env_1.env.PUBLIC_APP_URL.replace(/\/$/, '')}/reset-password?token=${rawToken}`;
        const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333;">Réinitialisation de mot de passe</h2>
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe AFI-LISTEN. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien est valide pendant 1 heure.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #000; color: #fff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Réinitialiser mon mot de passe</a>
        </div>
        <p style="word-break: break-all; color: #999; font-size: 12px;">Si le bouton ne fonctionne pas, copiez ce lien : <br/> ${resetUrl}</p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} AFI-LISTEN. Tous droits réservés.</p>
      </div>
    `;
        await (0, mail_service_1.sendTransactionalEmail)({
            to: user.email,
            subject: 'Réinitialisation du mot de passe AFI-LISTEN',
            text: `Vous avez demandé une réinitialisation de mot de passe. Ouvrez ce lien (valide 1 heure) : ${resetUrl}`,
            html,
        }).catch((err) => {
            console.error('Failed to send password reset email:', err);
        });
    },
    async resetPassword(input) {
        const tokenHash = hashResetToken(input.token.trim());
        const record = await auth_repository_1.authRepository.findPasswordResetByTokenHash(tokenHash);
        if (!record || record.expiresAt < new Date() || record.usedAt) {
            throw new AppError_1.UnauthorizedError('Invalid or expired reset token');
        }
        const user = record.user;
        const newHash = await bcrypt_1.default.hash(input.newPassword, SALT_ROUNDS);
        await auth_repository_1.authRepository.updatePassword(user.id, newHash);
        await auth_repository_1.authRepository.markPasswordResetUsed(record.id);
        await auth_repository_1.authRepository.deleteAllUserRefreshTokens(user.id);
    },
    async refresh(token) {
        const stored = await auth_repository_1.authRepository.findRefreshToken(token);
        if (!stored || stored.expiresAt < new Date()) {
            if (stored)
                await auth_repository_1.authRepository.deleteRefreshToken(token);
            throw new AppError_1.UnauthorizedError('Refresh token invalid or expired');
        }
        await auth_repository_1.authRepository.deleteRefreshToken(token);
        const user = stored.user;
        if (!user.emailVerified) {
            throw new AppError_1.UnauthorizedError('Session ended: email verification required.');
        }
        const { accessToken, refreshToken } = await generateTokens({
            id: user.id,
            role: user.role,
            schoolId: user.schoolId,
            campusIds: user.campuses?.map((c) => c.id) || [],
            classId: user.classId,
        });
        return { token: accessToken, refreshToken };
    },
    async logout(token) {
        await auth_repository_1.authRepository.deleteRefreshToken(token).catch(() => { });
    },
    async getMe(userId) {
        const user = await auth_repository_1.authRepository.findById(userId);
        if (!user) {
            throw new AppError_1.NotFoundError('User');
        }
        return toSafeUserWithAvatar(user);
    },
    async changePassword(userId, input) {
        const user = await auth_repository_1.authRepository.findById(userId);
        if (!user) {
            throw new AppError_1.NotFoundError('User');
        }
        const isValid = await bcrypt_1.default.compare(input.currentPassword, user.passwordHash);
        if (!isValid) {
            throw new AppError_1.UnauthorizedError('Current password is incorrect');
        }
        const newHash = await bcrypt_1.default.hash(input.newPassword, SALT_ROUNDS);
        await auth_repository_1.authRepository.updatePassword(userId, newHash);
    },
    async updateProfile(userId, input) {
        const user = await auth_repository_1.authRepository.findById(userId);
        if (!user) {
            throw new AppError_1.NotFoundError('User');
        }
        const trimOrNull = (v) => {
            if (v === undefined)
                return undefined;
            if (v === null)
                return null;
            const t = v.trim();
            return t === '' ? null : t;
        };
        const matricule = input.matricule !== undefined ? trimOrNull(input.matricule) : undefined;
        if (matricule !== undefined && matricule !== user.matricule) {
            if (matricule) {
                const taken = await prisma_1.prisma.user.findFirst({
                    where: { matricule, NOT: { id: userId } },
                });
                if (taken)
                    throw new AppError_1.ConflictError('Matricule already in use');
            }
        }
        const payload = {
            ...(input.firstName !== undefined && { firstName: input.firstName }),
            ...(input.lastName !== undefined && { lastName: input.lastName }),
            ...(input.matricule !== undefined && { matricule }),
            ...(input.numero !== undefined && { numero: trimOrNull(input.numero) ?? null }),
            ...(input.phone !== undefined && { phone: trimOrNull(input.phone) ?? null }),
        };
        if (Object.keys(payload).length === 0) {
            return toSafeUserWithAvatar(user);
        }
        const updated = await auth_repository_1.authRepository.updateProfile(userId, payload);
        return toSafeUserWithAvatar(updated);
    },
    async uploadAvatar(userId, file) {
        const user = await auth_repository_1.authRepository.findById(userId);
        if (!user)
            throw new AppError_1.NotFoundError('User');
        const { path } = await uploads_service_1.uploadsService.uploadProfileImage(file, `avatars/users/${userId}`);
        if (user.avatarPath && user.avatarPath !== path) {
            await uploads_service_1.uploadsService.removeObjectAtPath(user.avatarPath).catch(() => { });
        }
        const updated = await auth_repository_1.authRepository.updateAvatarPath(userId, path);
        return toSafeUserWithAvatar(updated);
    },
    async clearAvatar(userId) {
        const user = await auth_repository_1.authRepository.findById(userId);
        if (!user)
            throw new AppError_1.NotFoundError('User');
        if (user.avatarPath) {
            await uploads_service_1.uploadsService.removeObjectAtPath(user.avatarPath).catch(() => { });
        }
        const updated = await auth_repository_1.authRepository.updateAvatarPath(userId, null);
        return toSafeUserWithAvatar(updated);
    },
    async resendOtp(challengeId, schoolId) {
        const oldChallenge = await auth_repository_1.authRepository.findLoginOtpChallengeById(challengeId);
        if (!oldChallenge) {
            throw new AppError_1.BadRequestError('Invalid or expired challenge session');
        }
        if (oldChallenge.user.schoolId !== schoolId) {
            throw new AppError_1.BadRequestError('Invalid or expired challenge session');
        }
        // Delete all existing challenges to avoid stale ones
        await auth_repository_1.authRepository.deleteLoginChallengesForUser(oldChallenge.userId);
        return this.sendNewRegisterOtp(oldChallenge.user);
    },
};
//# sourceMappingURL=auth.service.js.map