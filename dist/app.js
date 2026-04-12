"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const error_middleware_1 = require("./core/middleware/error.middleware");
const app = (0, express_1.default)();
// ── Core middleware ──────────────────────────────────────────────────────────
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// ── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
    res.json({ success: true, message: "Server is healthy", data: null, error: null });
});
// ── Module routes ────────────────────────────────────────────────────────────
const auth_route_1 = require("./modules/auth/auth.route");
const reports_route_1 = require("./modules/reports/reports.route");
const evaluations_route_1 = require("./modules/evaluations/evaluations.route");
const ai_route_1 = require("./modules/ai/ai.route");
const decisions_route_1 = require("./modules/decisions/decisions.route");
app.use("/api/auth", auth_route_1.authRouter);
app.use("/api/reports", reports_route_1.reportsRouter);
app.use("/api/evaluations", evaluations_route_1.evaluationsRouter);
app.use("/api/ai", ai_route_1.aiRouter);
app.use("/api/decisions", decisions_route_1.decisionsRouter);
// ── 404 handler (must come after all routes) ──────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: "Route not found", data: null, error: "NOT_FOUND" });
});
// ── Global error handler (MUST be last) ─────────────────────────────────────
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
//# sourceMappingURL=app.js.map