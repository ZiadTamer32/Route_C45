import { JWT_SECRET_ADMIN, JWT_SECRET_USER } from "../../config/app.config.js";

export const ROLE_SECRETS = {
  user: JWT_SECRET_USER,
  admin: JWT_SECRET_ADMIN,
};
