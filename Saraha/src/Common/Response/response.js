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
  return res.status(statusCode).json({ msg: "success", result });
}

export function badRequest(res, message = "Bad Request") {
  return res.status(400).json({ msg: message });
}

export function unauthorized(res, message = "Unauthorized") {
  return res.status(401).json({ msg: message });
}

export function forbidden(res, message = "Forbidden") {
  return res.status(403).json({ msg: message });
}

export function notFound(res, message = "Not Found") {
  return res.status(404).json({ msg: message });
}

export function conflict(res, message = "Conflict") {
  return res.status(409).json({ msg: message });
}

export function serverError(res, message = "Internal Server Error") {
  return res.status(500).json({ msg: message });
}
