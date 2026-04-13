"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classModulesService = void 0;
const class_modules_repository_1 = require("./class-modules.repository");
const AppError_1 = require("../../core/errors/AppError");
exports.classModulesService = {
    async getAll(filters) {
        return class_modules_repository_1.classModulesRepository.findAll(filters);
    },
    async getById(id) {
        const assignment = await class_modules_repository_1.classModulesRepository.findById(id);
        if (!assignment)
            throw new AppError_1.NotFoundError('Module Assignment');
        return assignment;
    },
    async create(data) {
        // Check if assignment already exists
        const existing = await class_modules_repository_1.classModulesRepository.findByClassAndModule(data.classId, data.moduleId);
        if (existing) {
            throw new AppError_1.ConflictError('This module is already assigned to this class');
        }
        return class_modules_repository_1.classModulesRepository.create(data);
    },
    async update(id, data) {
        await this.getById(id);
        return class_modules_repository_1.classModulesRepository.update(id, data);
    },
    async delete(id) {
        await this.getById(id);
        return class_modules_repository_1.classModulesRepository.delete(id);
    },
};
//# sourceMappingURL=class-modules.service.js.map