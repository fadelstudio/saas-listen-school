import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";
import { env } from "../config/env";
import { Prisma } from "@prisma/client";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    res.sendError("Validation failed", 422, err.flatten().fieldErrors);
    return;
  }

  // Known operational errors
  if (err instanceof AppError) {
    res.sendError(err.message, err.statusCode);
    return;
  }

  // Prisma Database Errors (Suppress raw stack trace in output but log for dev)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    console.error("🛠️ Prisma DB Error:", err); // Developer log
    const code = err.code;

    if (code === 'P2002') {
      res.sendError("Validation failed: This resource already exists (Unique constraint).", 409);
      return;
    }
    if (code === 'P2003') {
      res.sendError("Validation failed: Invalid reference (Foreign key constraint).", 422);
      return;
    }
    if (code === 'P2025') {
      res.sendError("Resource not found or already deleted.", 404);
      return;
    }

    res.sendError("A database error occurred.", 422);
    return;
  }

  // Unknown errors — never expose stack in production
  const message =
    env.NODE_ENV === "development" && err instanceof Error
      ? err.message
      : "Internal server error";

  console.error("❌ Unhandled error:", err);
  res.sendError(message, 500);
}
