import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../../config/app.config.js";
const generateToken = (userID, res) => {
  const token = jwt.sign({ id: userID }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 60 * 60 * 1000, // 1 Hour
  });

  return token;
};

export default generateToken;
