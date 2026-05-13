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
/// <reference types="multer" />
const prisma_1 = require("../../core/database/prisma");
const AppError_1 = require("../../core/errors/AppError");
const auth_repository_1 = require("./auth.repository");
const google_id_token_1 = require("./google-id-token");
const client_1 = require("@prisma/client");
const mail_service_1 = require("../../core/email/mail.service");
const mail_templates_1 = require("../../core/email/mail.templates");
const uploads_service_1 = require("../uploads/uploads.service");
const notifications_service_1 = require("../notifications/notifications.service");
const logger_1 = require("../../utils/logger");
const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY_DAYS = 30;
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;
const GOOGLE_PENDING_PURPOSE = 'google_student_pending';
const GOOGLE_PENDING_EXPIRY_SEC = 15 * 60;
function signGooglePendingJwt(payload) {
    return jsonwebtoken_1.default.sign({ ...payload, purpose: GOOGLE_PENDING_PURPOSE }, env_1.env.JWT_SECRET, { expiresIn: GOOGLE_PENDING_EXPIRY_SEC });
}
function verifyGooglePendingJwt(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        if (decoded.purpose !== GOOGLE_PENDING_PURPOSE) {
            throw new AppError_1.UnauthorizedError('Invalid pending token');
        }
        return decoded;
    }
    catch (e) {
        if (e instanceof AppError_1.UnauthorizedError)
            throw e;
        throw new AppError_1.UnauthorizedError('Invalid or expired pending token');
    }
}
async function assertClassBelongsToSchool(schoolId, classId, campusId) {
    const cls = await prisma_1.prisma.class.findFirst({
        where: {
            id: classId,
            campus: { schoolId },
        },
        select: { campusId: true },
    });
    if (!cls) {
        throw new AppError_1.BadRequestError('Invalid class for this school');
    }
    if (campusId && campusId !== cls.campusId) {
        throw new AppError_1.BadRequestError('The selected class does not belong to this campus');
    }
    return { resolvedCampusId: cls.campusId };
}
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
function canUseOtpFallback() {
    return env_1.env.OTP_FALLBACK_ENABLED && !!env_1.env.OTP_FALLBACK_CODE;
}
function toSafeUser(user) {
    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        sex: user.sex || 'MALE',
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        matricule: user.matricule,
        numero: user.numero,
        phone: user.phone,
        bio: user.bio,
        address: user.address,
        campusIds: user.campuses?.map((c) => c.id) || [],
        campuses: user.campuses?.map((c) => ({ id: c.id, name: c.name || '' })),
        classId: user.classId,
        class: user.class ? { id: user.class.id, name: user.class.name } : null,
        schoolId: user.schoolId,
        hasPassword: !!user.passwordHash,
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
    // Create a unique session ID for single session enforcement
    const sessionId = crypto_1.default.randomBytes(16).toString('hex');
    // Update user with the new session ID
    await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: { currentSessionId: sessionId }
    });
    const payload = {
        userId: user.id,
        role: user.role,
        sid: sessionId // 'sid' for session ID
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
        logger_1.logger.info('[AuthService] Registering student', { email: input.email, classId: input.classId, schoolId });
        if (!input.classId) {
            throw new AppError_1.BadRequestError('Student must be assigned to a class');
        }
        const existing = await auth_repository_1.authRepository.findByEmail(input.email, schoolId);
        if (existing) {
            throw new AppError_1.ConflictError('An account with this email already exists');
        }
        const passwordHash = await bcrypt_1.default.hash(input.password, SALT_ROUNDS);
        const otpRequired = await isRegisterOtpRequiredForSchool(schoolId);
        // If student chooses a class but no campus, resolve the campus from the class
        let campusId = input.campusId;
        if (input.classId && !campusId) {
            const classRecord = await prisma_1.prisma.class.findUnique({
                where: { id: input.classId },
                select: { campusId: true }
            });
            if (classRecord)
                campusId = classRecord.campusId;
        }
        const user = await auth_repository_1.authRepository.create({
            ...input,
            campusId,
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
        if (!user.passwordHash) {
            throw new AppError_1.UnauthorizedError('This account uses Google sign-in. Please use the Google button.');
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
        // ── WELCOME NOTIFICATION (désactivable via NOTIFY_ON_LOGIN=false) ──
        if (process.env.NOTIFY_ON_LOGIN !== 'false') {
            notifications_service_1.notificationService.create({
                title: 'Connexion réussie',
                message: `Bienvenue, ${user.firstName} ! Vous êtes connecté(e) à votre espace AFI-LISTEN.`,
                type: 'LOGIN_WELCOME',
                userId: user.id,
                schoolId: user.schoolId,
            }).catch(err => logger_1.logger.warn('[Notification] login welcome failed', { error: err.message }));
        }
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
        // Direct link to verify email via the API (one-click)
        const verifyUrl = `${publicUrl}/api/auth/register/verify-link?challengeId=${challenge.id}`;
        const html = mail_templates_1.mailTemplates.otpTemplate(otp, otpExpiresMin, verifyUrl);
        (0, mail_service_1.sendTransactionalEmail)({
            to: user.email,
            subject: env_1.env.OTP_EMAIL_SUBJECT || `Code de vérification ${siteName}`,
            text: `Votre code de vérification : ${otp}\nIl expire dans ${otpExpiresMin} minutes.\nAide: ${helpUrl}`,
            html,
        }).catch((err) => {
            logger_1.logger.error('[AuthService] Failed to queue OTP email', { error: err?.message });
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
        const fallbackMatch = canUseOtpFallback() && input.otp.trim() === env_1.env.OTP_FALLBACK_CODE;
        if (expected !== challenge.otpHash && !fallbackMatch) {
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
    async verifyRegisterLink(challengeId) {
        const challenge = await auth_repository_1.authRepository.findLoginOtpChallengeById(challengeId);
        if (!challenge || challenge.expiresAt < new Date()) {
            if (challenge)
                await auth_repository_1.authRepository.deleteLoginOtpChallenge(challenge.id);
            return `${env_1.env.PUBLIC_WEB_URL}/verify-error?reason=expired`;
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: challenge.userId },
            include: { school: true },
        });
        if (!user)
            return `${env_1.env.PUBLIC_WEB_URL}/verify-error?reason=user_not_found`;
        await auth_repository_1.authRepository.deleteLoginOtpChallenge(challenge.id);
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: true, emailVerifiedAt: new Date() },
        });
        const slug = user.school?.slug || 'afi';
        return `${env_1.env.PUBLIC_WEB_URL}/${slug}/login?verified=true`;
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
        const slug = user.school?.slug || 'afi';
        const resetUrl = `${env_1.env.PUBLIC_WEB_URL.replace(/\/$/, '')}/${slug}/reset-password?token=${rawToken}`;
        const html = mail_templates_1.mailTemplates.passwordResetTemplate(resetUrl);
        (0, mail_service_1.sendTransactionalEmail)({
            to: user.email,
            subject: 'Réinitialisation du mot de passe AFI-LISTEN',
            text: `Vous avez demandé une réinitialisation de mot de passe. Ouvrez ce lien (valide 1 heure) : ${resetUrl}`,
            html,
        }).catch((err) => {
            logger_1.logger.error('[AuthService] Failed to queue password reset email', { error: err?.message });
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
        if (user.passwordHash) {
            const current = input.currentPassword ?? '';
            if (!current) {
                throw new AppError_1.BadRequestError('Current password is required');
            }
            const isValid = await bcrypt_1.default.compare(current, user.passwordHash);
            if (!isValid) {
                throw new AppError_1.UnauthorizedError('Current password is incorrect');
            }
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
            ...(input.bio !== undefined && { bio: trimOrNull(input.bio) ?? null }),
            ...(input.address !== undefined && { address: trimOrNull(input.address) ?? null }),
            ...(input.sex !== undefined && { sex: input.sex }),
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
    async googleStart(idToken, schoolId) {
        if (!(0, google_id_token_1.isGoogleAuthConfigured)()) {
            throw new AppError_1.BadRequestError('Google sign-in is not configured on this server');
        }
        let g;
        try {
            g = await (0, google_id_token_1.verifyGoogleIdToken)(idToken);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            logger_1.logger.warn('[AuthService] Google token verification failed', { message: msg });
            throw new AppError_1.UnauthorizedError('Invalid Google credentials');
        }
        if (!g.emailVerified) {
            throw new AppError_1.BadRequestError('Your Google account email must be verified before you can sign in');
        }
        const lowerEmail = g.email.trim().toLowerCase();
        const byGoogle = await auth_repository_1.authRepository.findByGoogleId(g.sub);
        if (byGoogle) {
            if (byGoogle.schoolId !== schoolId) {
                const slug = byGoogle.school?.slug || 'another school';
                throw new AppError_1.UnauthorizedError(`This Google account is already linked to another school (${slug}). Open that school’s portal.`);
            }
            if (!byGoogle.isActive) {
                throw new AppError_1.UnauthorizedError('Account is deactivated. Contact an administrator.');
            }
            if (!byGoogle.emailVerified) {
                throw new AppError_1.UnauthorizedError('Email not verified. Complete verification or contact support.');
            }
            if (byGoogle.role === client_1.Role.STUDENT && !byGoogle.classId) {
                return {
                    step: 'GOOGLE_SELECT_CLASS',
                    pendingToken: signGooglePendingJwt({
                        kind: 'link',
                        googleSub: g.sub,
                        schoolId,
                        userId: byGoogle.id,
                    }),
                    expiresInSeconds: GOOGLE_PENDING_EXPIRY_SEC,
                };
            }
            const { accessToken, refreshToken } = await generateTokens({
                id: byGoogle.id,
                role: byGoogle.role,
                schoolId: byGoogle.schoolId,
                campusIds: byGoogle.campuses?.map((c) => c.id) || [],
                classId: byGoogle.classId,
            });
            if (process.env.NOTIFY_ON_LOGIN !== 'false') {
                notifications_service_1.notificationService
                    .create({
                    title: 'Connexion réussie',
                    message: `Bienvenue, ${byGoogle.firstName} ! Vous êtes connecté(e) à votre espace AFI-LISTEN.`,
                    type: 'LOGIN_WELCOME',
                    userId: byGoogle.id,
                    schoolId: byGoogle.schoolId,
                })
                    .catch((err) => logger_1.logger.warn('[Notification] login welcome failed', { error: err?.message }));
            }
            return { token: accessToken, refreshToken, user: await toSafeUserWithAvatar(byGoogle) };
        }
        const existing = await auth_repository_1.authRepository.findByEmailGlobal(lowerEmail);
        if (existing) {
            if (existing.schoolId !== schoolId) {
                const slug = existing.school?.slug || 'another tenant';
                throw new AppError_1.UnauthorizedError(`This email is registered with another school (${slug}). Use the correct school URL or header x-school-slug.`);
            }
            if (existing.passwordHash && !existing.googleId) {
                throw new AppError_1.ConflictError('An account with this email already exists. Sign in with your password or use forgot password.');
            }
            if (existing.googleId && existing.googleId !== g.sub) {
                throw new AppError_1.ConflictError('This email is already linked to a different Google account.');
            }
            if (!existing.passwordHash && !existing.googleId) {
                throw new AppError_1.BadRequestError('This account cannot use Google sign-in. Contact support.');
            }
            throw new AppError_1.ConflictError('Unable to start Google sign-in with this email. Try signing in again.');
        }
        return {
            step: 'GOOGLE_SELECT_CLASS',
            pendingToken: signGooglePendingJwt({
                kind: 'new',
                googleSub: g.sub,
                schoolId,
                email: lowerEmail,
                firstName: g.firstName,
                lastName: g.lastName,
            }),
            expiresInSeconds: GOOGLE_PENDING_EXPIRY_SEC,
        };
    },
    async googleComplete(input, schoolId) {
        const pending = verifyGooglePendingJwt(input.pendingToken);
        if (pending.schoolId !== schoolId) {
            throw new AppError_1.UnauthorizedError('Invalid session for this school context');
        }
        const { resolvedCampusId } = await assertClassBelongsToSchool(schoolId, input.classId, input.campusId);
        if (pending.kind === 'link' && pending.userId) {
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: pending.userId },
                include: {
                    campuses: { select: { id: true, name: true } },
                    class: { select: { id: true, name: true } },
                },
            });
            if (!user || user.googleId !== pending.googleSub || user.schoolId !== schoolId) {
                throw new AppError_1.UnauthorizedError('Invalid or expired Google sign-in session');
            }
            if (user.role !== client_1.Role.STUDENT) {
                throw new AppError_1.BadRequestError('Only students use the class selection step.');
            }
            const updated = await auth_repository_1.authRepository.updateStudentClassAndCampus(user.id, input.classId, resolvedCampusId);
            const { accessToken, refreshToken } = await generateTokens({
                id: updated.id,
                role: updated.role,
                schoolId: updated.schoolId,
                campusIds: updated.campuses?.map((c) => c.id) || [],
                classId: updated.classId,
            });
            if (process.env.NOTIFY_ON_LOGIN !== 'false') {
                notifications_service_1.notificationService
                    .create({
                    title: 'Connexion réussie',
                    message: `Bienvenue, ${updated.firstName} ! Vous êtes connecté(e) à votre espace AFI-LISTEN.`,
                    type: 'LOGIN_WELCOME',
                    userId: updated.id,
                    schoolId: updated.schoolId,
                })
                    .catch((err) => logger_1.logger.warn('[Notification] login welcome failed', { error: err?.message }));
            }
            return { token: accessToken, refreshToken, user: await toSafeUserWithAvatar(updated) };
        }
        if (pending.kind === 'new') {
            if (!pending.email || pending.firstName === undefined || pending.lastName === undefined) {
                throw new AppError_1.UnauthorizedError('Invalid pending token payload');
            }
            const dup = await auth_repository_1.authRepository.findByEmailGlobal(pending.email);
            if (dup) {
                throw new AppError_1.ConflictError('An account was created with this email meanwhile. Sign in again.');
            }
            const otpRequired = await isRegisterOtpRequiredForSchool(schoolId);
            const user = await auth_repository_1.authRepository.createStudentFromGoogle({
                email: pending.email,
                firstName: pending.firstName,
                lastName: pending.lastName,
                schoolId,
                classId: input.classId,
                campusId: resolvedCampusId,
                googleId: pending.googleSub,
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
                if (process.env.NOTIFY_ON_LOGIN !== 'false') {
                    notifications_service_1.notificationService
                        .create({
                        title: 'Connexion réussie',
                        message: `Bienvenue, ${user.firstName} ! Vous êtes connecté(e) à votre espace AFI-LISTEN.`,
                        type: 'LOGIN_WELCOME',
                        userId: user.id,
                        schoolId: user.schoolId,
                    })
                        .catch((err) => logger_1.logger.warn('[Notification] login welcome failed', { error: err?.message }));
                }
                return { token: accessToken, refreshToken, user: await toSafeUserWithAvatar(user) };
            }
            return this.sendNewRegisterOtp(user);
        }
        throw new AppError_1.UnauthorizedError('Invalid Google sign-in session');
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
    async resendVerification(userId) {
        const user = await auth_repository_1.authRepository.findById(userId);
        if (!user)
            throw new AppError_1.NotFoundError('User');
        if (user.emailVerified)
            throw new AppError_1.BadRequestError('Email is already verified');
        // Delete existing challenges
        await auth_repository_1.authRepository.deleteLoginChallengesForUser(userId);
        return this.sendNewRegisterOtp(user);
    },
};
//# sourceMappingURL=auth.service.js.map