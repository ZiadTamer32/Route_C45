import jwt from "jsonwebtoken";
import { unauthorized } from "./Response/response.js";
import { ROLE_SECRETS } from "./constans.js";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return unauthorized(res, "Unauthorized");
  }

  const token = authHeader.split(" ")[1];

  const decoded = jwt.decode(token);

  if (!decoded || !decoded.aud) {
    return unauthorized(res, "Invalid token structure");
  }

  const secret = ROLE_SECRETS[decoded.aud];

  if (!secret) {
    return unauthorized(res, "Unknown token role");
  }

  try {
    const verified = jwt.verify(token, secret);
    req.user = verified;
    next();
  } catch (err) {
    return unauthorized(res, "Invalid or expired token");
  }
};
