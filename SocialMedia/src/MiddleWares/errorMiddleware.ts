import type { NextFunction, Request, Response } from "express";

interface IError extends Error {
  statusCode: number;
}

export function globalErrorHandling(
  err: IError,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  res
    .status(err.statusCode || 400)
    .json({ message: err.message, stack: err.stack, error: err.cause });
}
