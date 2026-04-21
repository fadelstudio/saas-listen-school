import { Request, Response, NextFunction } from 'express';
import { uploadsService } from './uploads.service';
import { BadRequestError } from '../../core/errors/AppError';

export const uploadsController = {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      const folder = (req.body?.folder as string) || 'general';
      const bucket = (req.query?.bucket as string) || 'attachments';
      if (!file) {
        throw new BadRequestError('file is required (multipart/form-data)');
      }
      const result = await uploadsService.uploadFile(file as Express.Multer.File, folder, bucket);
      res.sendSuccess('File uploaded successfully', result, 201);
    } catch (error) {
      next(error);
    }
  }
};
