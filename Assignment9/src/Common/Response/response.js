import { NODE_ENV } from "../../../config/app.config.js";

export function globalErrorHandling(error, req, res, next) {
  return NODE_ENV === "dev"
    ? res.status(error.cause?.statusCode ?? 500).json({
        errMsg: error.message,
        error,
        stack: error.stack,
      })
    : res.status(error.cause?.statusCode ?? 500).json({
        errMsg: error.message || "Something went wrong",
      });
}

export function successResponse(res, statusCode = 200, result) {
  return res.status(statusCode).json({ msg: "done", result });
}
