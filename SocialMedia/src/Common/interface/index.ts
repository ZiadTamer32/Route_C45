import { JwtPayload } from "jsonwebtoken";
import { GenderEnum, ProviderEnum, RoleEnum } from "../enums/index.js";
import { Request } from "express";

export interface IUser {
  userName: string;
  email: string;
  password: string;
  phone: string;
  gender: GenderEnum;
  role?: RoleEnum;
  isVerified?: boolean;
  provider?: ProviderEnum;
  visitCount?: number;
  profilePic?: string;
  coverPic?: string;
  gallery?: [string];
  DOB?: Date;
  changeCreditTime?: Date;
  twoStepVerification?: boolean;
}

export interface IRequest extends Request {
  user?: JwtPayload;
}
