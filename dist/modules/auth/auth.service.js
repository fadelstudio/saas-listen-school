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
const AppError_1 = require("../../core/errors/AppError");
const auth_repository_1 = require("./auth.repository");
const mail_service_1 = require("../../core/email/mail.service");
const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;
function otpEnabled() {
    return process.env.LOGIN_OTP_ENABLED !== 'false';
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
        campusId: user.campusId,
        classId: user.classId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}
async function generateTokens(user) {
    const payload = {
        userId: user.id,
        role: user.role,
    };
    if (user.campusId != null)
        payload.campusId = user.campusId;
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
    async register(input) {
        const existing = await auth_repository_1.authRepository.findByEmail(input.email);
        if (existing) {
            throw new AppError_1.ConflictError('An account with this email already exists');
        }
        const passwordHash = await bcrypt_1.default.hash(input.password, SALT_ROUNDS);
        const user = await auth_repository_1.authRepository.create({
            ...input,
            passwordHash,
        });
        const { accessToken, refreshToken } = await generateTokens({
            id: user.id,
            role: user.role,
            campusId: user.campusId,
            classId: user.classId,
        });
        return { token: accessToken, refreshToken, user: toSafeUser(user) };
    },
    async login(input) {
        const identifier = input.email || input.matricule;
        if (!identifier) {
            throw new AppError_1.UnauthorizedError('Email or matricule must be provided');
        }
        const user = await auth_repository_1.authRepository.findByIdentifier(identifier);
        if (!user) {
            throw new AppError_1.UnauthorizedError('Invalid credentials');
        }
        if (!user.isActive) {
            throw new AppError_1.UnauthorizedError('Account is deactivated. Contact an administrator.');
        }
        const isValidPassword = await bcrypt_1.default.compare(input.password, user.passwordHash);
        if (!isValidPassword) {
            throw new AppError_1.UnauthorizedError('Invalid email or password');
        }
        if (!otpEnabled()) {
            const { accessToken, refreshToken } = await generateTokens({
                id: user.id,
                role: user.role,
                campusId: user.campusId,
                classId: user.classId,
            });
            return { token: accessToken, refreshToken, user: toSafeUser(user) };
        }
        await auth_repository_1.authRepository.deleteLoginChallengesForUser(user.id);
        const otp = generateNumericOtp();
        const otpHash = hashOtp(otp);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
        const challenge = await auth_repository_1.authRepository.createLoginOtpChallenge(user.id, otpHash, expiresAt);
        await (0, mail_service_1.sendTransactionalEmail)({
            to: user.email,
            subject: 'Code de connexion AFI-LISTEN',
            text: `Votre code de connexion (valide 10 minutes) : ${otp}\n\nSi vous n'avez pas demandé cette connexion, ignorez cet email.`,
        }).catch(() => { });
        return {
            step: 'EMAIL_OTP_REQUIRED',
            challengeId: challenge.id,
            expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
        };
    },
    async verifyLoginOtp(input) {
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
            await auth_repository_1.authRepository.incrementLoginOtpAttempts(challenge.id);
            throw new AppError_1.UnauthorizedError('Invalid OTP code');
        }
        await auth_repository_1.authRepository.deleteLoginOtpChallenge(challenge.id);
        const user = challenge.user;
        const { accessToken, refreshToken } = await generateTokens({
            id: user.id,
            role: user.role,
            campusId: user.campusId,
            classId: user.classId,
        });
        return { token: accessToken, refreshToken, user: toSafeUser(user) };
    },
    async forgotPassword(input) {
        const user = await auth_repository_1.authRepository.findByEmail(input.email);
        if (!user) {
            return;
        }
        const rawToken = crypto_1.default.randomBytes(32).toString('hex');
        const tokenHash = hashResetToken(rawToken);
        const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);
        await auth_repository_1.authRepository.deletePasswordResetTokensForUser(user.id);
        await auth_repository_1.authRepository.createPasswordResetToken(user.id, tokenHash, expiresAt);
        const resetUrl = `${env_1.env.PUBLIC_APP_URL.replace(/\/$/, '')}/reset-password?token=${rawToken}`;
        await (0, mail_service_1.sendTransactionalEmail)({
            to: user.email,
            subject: 'Réinitialisation du mot de passe AFI-LISTEN',
            text: `Vous avez demandé une réinitialisation de mot de passe.\n\nOuvrez ce lien (valide 1 heure) :\n${resetUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.`,
        }).catch(() => { });
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
        const { accessToken, refreshToken } = await generateTokens({
            id: user.id,
            role: user.role,
            campusId: user.campusId,
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
        return toSafeUser(user);
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
        const updated = await auth_repository_1.authRepository.updateProfile(userId, input);
        return toSafeUser(updated);
    },
};
//# sourceMappingURL=auth.service.js.map