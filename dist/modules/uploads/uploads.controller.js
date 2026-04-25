"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadsController = void 0;
const uploads_service_1 = require("./uploads.service");
const AppError_1 = require("../../core/errors/AppError");
exports.uploadsController = {
    async upload(req, res, next) {
        try {
            const file = req.file;
            const folder = req.body?.folder || 'general';
            const bucket = req.query?.bucket || 'attachments';
            if (!file) {
                throw new AppError_1.BadRequestError('file is required (multipart/form-data)');
            }
            const result = await uploads_service_1.uploadsService.uploadFile(file, folder, bucket);
            res.sendSuccess('File uploaded successfully', result, 201);
        }
        catch (error) {
            next(error);
        }
    }
};
//# sourceMappingURL=uploads.controller.js.map