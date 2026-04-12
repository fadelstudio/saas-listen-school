import { Request, Response, NextFunction } from 'express';
import { uploadsService } from './uploads.service';
import { sendSuccess } from '../../utils/response';

export const uploadsController = {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      const folder = req.body.folder || 'general';
      const result = await uploadsService.uploadFile(file as Express.Multer.File, folder);
      sendSuccess(res, 'File uploaded successfully', result, 201);
    } catch (error) {
      next(error);
    }
  }
};
