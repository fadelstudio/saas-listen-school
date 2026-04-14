"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./core/config/swagger");
const error_middleware_1 = require("./core/middleware/error.middleware");
const app = (0, express_1.default)();
// ── Documentation ────────────────────────────────────────────────────────────
// Note: Swagger mounted before security if you want it accessible without rate limit, 
// but usually it's fine after. We put it here.
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
// ── Security & Performance middleware ────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// ── Custom middlewares ───────────────────────────────────────────────────────
const response_middleware_1 = require("./core/middleware/response.middleware");
app.use(response_middleware_1.responseMiddleware);
app.set('trust proxy', 1);
// ── Rate limiting ─────────────────────────────────────────────────────────────
// Rate limiting: 100 requests per 15 minutes by default
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 500, // Increased for demo and testing
    message: { success: false, message: "Too many requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// ── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
    res.sendSuccess("Server is healthy", { uptime: process.uptime() });
});
// ── API Routes (v1) ──────────────────────────────────────────────────────────
const v1_1 = __importDefault(require("./core/routes/v1"));
// Mount v1 at /api/v1 AND /api for backward compatibility as requested
app.use("/api/v1", v1_1.default);
app.use("/api", v1_1.default);
// ── 404 handler (must come after all routes) ──────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: "Route not found", data: null, error: "NOT_FOUND" });
});
// ── Global error handler (MUST be last) ─────────────────────────────────────
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
//# sourceMappingURL=app.js.map