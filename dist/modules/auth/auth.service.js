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
const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
// ─── Helpers ─────────────────────────────────────────────────────────────────
function toSafeUser(user) {
    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        campusId: user.campusId,
        classId: user.classId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}
async function generateTokens(userId, role) {
    const payload = { userId, role };
    const accessToken = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshTokenString = crypto_1.default.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
    await auth_repository_1.authRepository.createRefreshToken(userId, refreshTokenString, expiresAt);
    return { accessToken, refreshToken: refreshTokenString };
}
// ─── Service ──────────────────────────────────────────────────────────────────
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
        const { accessToken, refreshToken } = await generateTokens(user.id, user.role);
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
        const { accessToken, refreshToken } = await generateTokens(user.id, user.role);
        return { token: accessToken, refreshToken, user: toSafeUser(user) };
    },
    async refresh(token) {
        const stored = await auth_repository_1.authRepository.findRefreshToken(token);
        if (!stored || stored.expiresAt < new Date()) {
            if (stored)
                await auth_repository_1.authRepository.deleteRefreshToken(token);
            throw new AppError_1.UnauthorizedError('Refresh token invalid or expired');
        }
        // Rotate token: delete old, create new
        await auth_repository_1.authRepository.deleteRefreshToken(token);
        const user = stored.user;
        const { accessToken, refreshToken } = await generateTokens(user.id, user.role);
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