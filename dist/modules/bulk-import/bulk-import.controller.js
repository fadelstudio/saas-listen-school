"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkImportController = void 0;
const bulk_import_service_1 = require("./bulk-import.service");
const AppError_1 = require("../../core/errors/AppError");
exports.bulkImportController = {
    async importStudents(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }
            const csvData = req.file.buffer.toString('utf8');
            const schoolId = req.schoolId;
            const campusId = req.body.campusId;
            if (!schoolId) {
                throw new AppError_1.BadRequestError('schoolId context missing');
            }
            if (!campusId) {
                return res.status(400).json({ success: false, message: 'campusId is required' });
            }
            const result = await bulk_import_service_1.bulkImportService.importStudents(schoolId, campusId, csvData);
            return res.sendSuccess('Bulk import processed', result);
        }
        catch (error) {
            return next(error);
        }
    },
    async importProfessors(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }
            const csvData = req.file.buffer.toString('utf8');
            const schoolId = req.schoolId;
            const campusId = req.body.campusId;
            if (!schoolId) {
                throw new AppError_1.BadRequestError('schoolId context missing');
            }
            if (!campusId) {
                return res.status(400).json({ success: false, message: 'campusId is required' });
            }
            const result = await bulk_import_service_1.bulkImportService.importProfessors(schoolId, campusId, csvData);
            return res.sendSuccess('Bulk import processed', result);
        }
        catch (error) {
            return next(error);
        }
    }
};
//# sourceMappingURL=bulk-import.controller.js.map