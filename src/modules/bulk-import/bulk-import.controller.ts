import { Request, Response, NextFunction } from 'express';
import { bulkImportService } from './bulk-import.service';
import { BadRequestError } from '../../core/errors/AppError';

export const bulkImportController = {
  async importStudents(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      const csvData = req.file.buffer.toString('utf8');
      const schoolId = req.user!.schoolId;
      const campusId = req.body.campusId as string;
      if (!schoolId) {
        throw new BadRequestError('schoolId context missing');
      }

      if (!campusId) {
        return res.status(400).json({ success: false, message: 'campusId is required' });
      }

      const result = await bulkImportService.importStudents(schoolId, campusId, csvData);
      return res.sendSuccess('Bulk import processed', result);
    } catch (error) {
      return next(error);
    }
  },

  async importProfessors(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      const csvData = req.file.buffer.toString('utf8');
      const schoolId = req.user!.schoolId;
      const campusId = req.body.campusId as string;
      if (!schoolId) {
        throw new BadRequestError('schoolId context missing');
      }

      if (!campusId) {
        return res.status(400).json({ success: false, message: 'campusId is required' });
      }

      const result = await bulkImportService.importProfessors(schoolId, campusId, csvData);
      return res.sendSuccess('Bulk import processed', result);
    } catch (error) {
      return next(error);
    }
  }
};
