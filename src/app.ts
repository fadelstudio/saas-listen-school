import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./core/config/swagger";
import { errorMiddleware } from "./core/middleware/error.middleware";

const app = express();

// ── Documentation ────────────────────────────────────────────────────────────
// Note: Swagger mounted before security if you want it accessible without rate limit, 
// but usually it's fine after. We put it here.
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Security & Performance middleware ────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Custom middlewares ───────────────────────────────────────────────────────
import { responseMiddleware } from "./core/middleware/response.middleware";
app.use(responseMiddleware);

// Rate limiting: 100 requests per 15 minutes by default
const limiter = rateLimit({
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
import v1Router from "./core/routes/v1";

// Mount v1 at /api/v1 AND /api for backward compatibility as requested
app.use("/api/v1", v1Router);
app.use("/api",    v1Router);

// ── 404 handler (must come after all routes) ──────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found", data: null, error: "NOT_FOUND" });
});

// ── Global error handler (MUST be last) ─────────────────────────────────────
app.use(errorMiddleware);

export default app;
