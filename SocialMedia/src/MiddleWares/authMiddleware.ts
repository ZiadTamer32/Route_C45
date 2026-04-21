import type { Response, NextFunction } from "express";
import { UnauthorizedException } from "../Common/exceptions/domain.exception.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET_USER } from "../config/app.config.js";
import userRepo from "../DB/repositories/user.repo.js";
import { IRequest } from "../Common/interface/index.js";

export const authentication = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedException("Unauthorized: Missing Bearer scheme");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new UnauthorizedException("Unauthorized: Token is missing");
  }

  let decodedToken: JwtPayload;
  try {
    decodedToken = jwt.verify(token, JWT_SECRET_USER) as JwtPayload;
  } catch (error) {
    throw new UnauthorizedException("Unauthorized: Invalid or expired token");
  }

  const user = await userRepo.findById({ id: decodedToken.id });

  if (!user) {
    throw new UnauthorizedException("Unauthorized: User not found");
  }

  req.user = decodedToken;

  next();
};
