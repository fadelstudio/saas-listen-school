"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadsController = void 0;
const uploads_service_1 = require("./uploads.service");
exports.uploadsController = {
    async upload(req, res, next) {
        try {
            const file = req.file;
            const folder = req.body.folder || 'general';
            const result = await uploads_service_1.uploadsService.uploadFile(file, folder);
            res.sendSuccess('File uploaded successfully', result, 201);
        }
        catch (error) {
            next(error);
        }
    }
};
//# sourceMappingURL=uploads.controller.js.map