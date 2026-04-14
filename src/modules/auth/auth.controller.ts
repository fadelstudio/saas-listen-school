import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      res.sendSuccess('Account created successfully', result, 201);
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      if ('step' in result && result.step === 'EMAIL_OTP_REQUIRED') {
        res.sendSuccess('OTP sent to your email', result);
      } else {
        res.sendSuccess('Login successful', result);
      }
    } catch (error) {
      next(error);
    }
  },

  async verifyLoginOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.verifyLoginOtp(req.body);
      res.sendSuccess('Login successful', result);
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.forgotPassword(req.body);
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
};
