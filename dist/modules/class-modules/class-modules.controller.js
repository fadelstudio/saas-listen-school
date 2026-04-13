"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classModulesController = void 0;
const class_modules_service_1 = require("./class-modules.service");
exports.classModulesController = {
    async getAll(req, res, next) {
        try {
            const filters = {
                classId: req.query.classId,
                moduleId: req.query.moduleId,
            };
            const assignments = await class_modules_service_1.classModulesService.getAll(filters);
            res.sendSuccess('Affectations récupérées', assignments);
        }
        catch (err) {
            next(err);
        }
    },
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const assignment = await class_modules_service_1.classModulesService.getById(id);
            res.sendSuccess('Affectation récupérée', assignment);
        }
        catch (err) {
            next(err);
        }
    },
    async create(req, res, next) {
        try {
            const assignment = await class_modules_service_1.classModulesService.create(req.body);
            res.sendSuccess('Affectation créée', assignment, 201);
        }
        catch (err) {
            next(err);
        }
    },
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const assignment = await class_modules_service_1.classModulesService.update(id, req.body);
            res.sendSuccess('Affectation mise à jour', assignment);
        }
        catch (err) {
            next(err);
        }
    },
    async remove(req, res, next) {
        try {
            const { id } = req.params;
            await class_modules_service_1.classModulesService.delete(id);
            res.sendSuccess('Affectation supprimée', null);
        }
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=class-modules.controller.js.map