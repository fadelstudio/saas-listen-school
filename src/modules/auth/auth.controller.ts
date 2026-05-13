import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { BadRequestError } from '../../core/errors/AppError';
import { notificationService } from '../notifications/notifications.service';
import { logger } from '../../utils/logger';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const result = await authService.register(req.body, req.schoolId);
      if ('step' in result && result.step === 'REGISTER_OTP_REQUIRED') {
        res.sendSuccess('Account created. OTP sent to your email for verification.', result, 201);
      } else {
        res.sendSuccess('Account created successfully', result, 201);
      }
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const result = await authService.login(req.body, req.schoolId);

      // Fusion invité → compte : déclenchée via UTI si fourni dans le corps de la requête
      // On n'attend pas la fusion pour répondre (fire-and-forget)
      const uti = req.body.uti as string | undefined;
      if (uti && 'user' in result && result.user?.id) {
        notificationService.updateFcmToken(result.user.id, '', uti).catch(err =>
          logger.warn('[Login] Fusion UTI→compte échouée (non bloquant)', { uti, error: err?.message })
        );
      }

      res.sendSuccess('Login successful', result);
    } catch (error) {
      next(error);
    }
  },

  async googleStart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const result = await authService.googleStart(req.body.idToken, req.schoolId);
      if ('step' in result && result.step === 'GOOGLE_SELECT_CLASS') {
        res.sendSuccess('Choose your class to finish Google sign-in', result);
        return;
      }
      if ('step' in result && result.step === 'REGISTER_OTP_REQUIRED') {
        res.sendSuccess('Account created. OTP sent to your email for verification.', result, 201);
        return;
      }
      res.sendSuccess('Google sign-in successful', result);
    } catch (error) {
      next(error);
    }
  },

  async googleComplete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const result = await authService.googleComplete(req.body, req.schoolId);
      if ('step' in result && result.step === 'REGISTER_OTP_REQUIRED') {
        res.sendSuccess('Account created. OTP sent to your email for verification.', result, 201);
        return;
      }
      res.sendSuccess('Google sign-in completed', result);
    } catch (error) {
      next(error);
    }
  },


  async verifyRegisterOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const result = await authService.verifyRegisterOtp(req.body, req.schoolId);
      res.sendSuccess('Registration verified. Login successful.', result);
    } catch (error) {
      next(error);
    }
  },

  async verifyRegisterLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { challengeId } = req.query as { challengeId: string };
      if (!challengeId) throw new BadRequestError('challengeId is required');
      
      const redirectUrl = await authService.verifyRegisterLink(challengeId);
      res.redirect(redirectUrl);
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      await authService.forgotPassword(req.body, req.schoolId);
      res.sendSuccess('If an account exists for this email, a reset link has been sent.', null);
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body as { token: string; newPassword: string };
      await authService.resetPassword({ token, newPassword });
      res.sendSuccess('Password has been reset. Please log in again.', null);
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getMe(req.user!.userId);
      res.sendSuccess('Profile retrieved', user);
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.changePassword(req.user!.userId, req.body);
      res.sendSuccess('Password changed successfully', null);
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.updateProfile(req.user!.userId, req.body);
      res.sendSuccess('Profile updated', user);
    } catch (error) {
      next(error);
    }
  },

  async uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file;
      if (!file) {
        throw new BadRequestError('file is required (multipart field: file)');
      }
      const user = await authService.uploadAvatar(req.user!.userId, file);
      res.sendSuccess('Profile photo updated', user);
    } catch (error) {
      next(error);
    }
  },

  async clearAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.clearAvatar(req.user!.userId);
      res.sendSuccess('Profile photo removed', user);
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refresh(refreshToken);
      res.sendSuccess('Token refreshed', result);
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      res.sendSuccess('Logged out successfully', null);
    } catch (error) {
      next(error);
    }
  },

  async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.schoolId) throw new BadRequestError('school context is required');
      const { challengeId } = req.body;
      const result = await authService.resendOtp(challengeId, req.schoolId);
      res.sendSuccess('New OTP sent successfully', result);
    } catch (error) {
      next(error);
    }
  },

  async resendVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.resendVerification(req.user!.userId);
      res.sendSuccess('Verification email sent successfully', result);
    } catch (error) {
      next(error);
    }
  },
};
