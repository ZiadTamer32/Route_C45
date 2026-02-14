import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/app.config.js";

export const isAuth = (req, res, next) => {
  try {
    // Get token from cookies
    const token = req?.cookies?.token;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach userId to request object
    req.userId = decoded.id;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token." });
  }
};
