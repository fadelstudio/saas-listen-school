import { Response } from "express";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  error: unknown | null;
}

export function sendSuccess<T>(
  res: Response,
  message: string,
  data: T,
  statusCode: number = 200
): Response {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    error: null,
  };
  return res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  error: unknown = null
): Response {
  const response: ApiResponse<null> = {
    success: false,
    message,
    data: null,
    error,
  };
  return res.status(statusCode).json(response);
}

export function sendCreated<T>(
  res: Response,
  message: string,
  data: T
): Response {
  return sendSuccess(res, message, data, 201);
}
