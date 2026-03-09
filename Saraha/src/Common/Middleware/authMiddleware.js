import jwt from "jsonwebtoken";
import { forbidden, unauthorized } from "../Response/response.js";
import { ROLE_SECRETS } from "../constans.js";
import { TokenEnum } from "../Enums/enums.js";

export const authentication = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return unauthorized(res, "Unauthorized");
  }

  const token = authHeader.split(" ")[1];

  const unverified = jwt.decode(token);

  if (!unverified?.aud) {
    return unauthorized(res, "Invalid token structure");
  }

  const [role, tokenType] = unverified.aud;

  const isRefreshUrl = req.url === "/renew-token";

  if (!isRefreshUrl && tokenType !== TokenEnum.access) {
    return unauthorized(res, "Invalid token type");
  }

  if (isRefreshUrl && tokenType !== TokenEnum.refresh) {
    return unauthorized(res, "Invalid token type");
  }

  const secret = isRefreshUrl
    ? ROLE_SECRETS[role]?.[1]
    : ROLE_SECRETS[role]?.[0];

  if (!secret) {
    return unauthorized(res, "Unknown token role");
  }

  const verified = jwt.verify(token, secret);
  req.user = verified;
  next();
};

export const authorization = (...roles) => {
  return (req, res, next) => {
    const [userRole] = req.user.aud;
    if (!roles.includes(userRole)) {
      return forbidden(res, "You don't have access to this endpoint");
    }
    next();
  };
};
