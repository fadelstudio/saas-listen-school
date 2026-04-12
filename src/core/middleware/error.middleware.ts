import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";
import { sendError } from "../../utils/response";
import { env } from "../config/env";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    sendError(res, "Validation failed", 422, err.flatten().fieldErrors);
    return;
  }

  // Known operational errors
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Prisma Database Errors (Suppress raw stack trace in output but log for dev)
  if (err && typeof err === 'object' && 'code' in err && 'name' in err && err.name === 'PrismaClientKnownRequestError') {
    console.error("🛠️ Prisma DB Error:", err); // Developer log
    const code = (err as any).code;

    if (code === 'P2002') {
      sendError(res, "Validation failed: This resource already exists (Unique constraint).", 409);
      return;
    }
    if (code === 'P2003') {
      sendError(res, "Validation failed: Invalid reference (Foreign key constraint).", 422);
      return;
    }
    if (code === 'P2025') {
      sendError(res, "Resource not found or already deleted.", 404);
      return;
    }

    sendError(res, "A database error occurred.", 422);
    return;
  }

  // Unknown errors — never expose stack in production
  const message =
    env.NODE_ENV === "development" && err instanceof Error
      ? err.message
      : "Internal server error";

  console.error("❌ Unhandled error:", err);
  sendError(res, message, 500);
}
