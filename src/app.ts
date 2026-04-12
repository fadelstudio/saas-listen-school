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

// Rate limiting: 100 requests per 15 minutes by default
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ success: true, message: "Server is healthy", data: null, error: null });
});

// ── Module routes ────────────────────────────────────────────────────────────
import { authRouter }        from "./modules/auth/auth.route";
import { reportsRouter }     from "./modules/reports/reports.route";
import { evaluationsRouter } from "./modules/evaluations/evaluations.route";
import { aiRouter }          from "./modules/ai/ai.route";
import { decisionsRouter }   from "./modules/decisions/decisions.route";
import { campusesRouter }    from "./modules/campuses/campuses.route";
import { classesRouter }     from "./modules/classes/classes.route";
import { professorsRouter }  from "./modules/professors/professors.route";
import { academicModulesRouter } from "./modules/academic-modules/academic-modules.route";
import { levelsRouter }          from "./modules/levels/levels.route";
import { systemRouter }          from "./modules/system/system.route";
import { uploadsRouter }         from "./modules/uploads/uploads.route";
import { classModulesRouter }    from "./modules/class-modules/class-modules.route";
import saasRouter from "./modules/saas/saas.route";

app.use("/api/auth",        authRouter);
app.use("/api/reports",     reportsRouter);
app.use("/api/evaluations", evaluationsRouter);
app.use("/api/ai",          aiRouter);
app.use("/api/decisions",   decisionsRouter);
app.use("/api/campuses",    campusesRouter);
app.use("/api/classes",     classesRouter);
app.use("/api/professors",  professorsRouter);
app.use("/api/academic-modules", academicModulesRouter);
app.use("/api/levels",           levelsRouter);
app.use("/api/system",           systemRouter);
app.use("/api/uploads",          uploadsRouter);
app.use("/api/assignments",      classModulesRouter);
app.use("/api/saas",             saasRouter);

// ── 404 handler (must come after all routes) ──────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found", data: null, error: "NOT_FOUND" });
});

// ── Global error handler (MUST be last) ─────────────────────────────────────
app.use(errorMiddleware);

export default app;
