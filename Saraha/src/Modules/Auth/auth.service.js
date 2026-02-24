import * as DBRepo from "../../DB/db.repository.js";
import jwt from "jsonwebtoken";
import sendEmail from "../../Common/sendEmail.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { UserModel } from "../../DB/Models/UserModel.js";
import { compareOperation, hashOperation } from "../../Common/Security/hash.js";
import { encryption } from "../../Common/Security/crypto.js";
import { JWT_EXPIRES_IN } from "../../../config/app.config.js";
import { ROLE_SECRETS } from "../../Common/constans.js";

export const signup = async (bodyData) => {
  const { email, password, phone } = bodyData;

  const isEmailExist = await DBRepo.findOne({
    model: UserModel,
    filters: { email },
  });

  if (isEmailExist) {
    throw new Error("Email already Exist", { cause: { statusCode: 409 } });
  }

  const hashedPassword = await hashOperation({ plainText: password });

  const phoneEncrypted = encryption(phone);

  const OTP = crypto.randomInt(100000, 1000000).toString();

  const hashedOTP = await bcrypt.hash(OTP, 10);

  const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const newUser = await DBRepo.create({
    model: UserModel,
    bodyData: {
      ...bodyData,
      password: hashedPassword,
      phone: phoneEncrypted,
      otp: hashedOTP,
      otpExpiresAt,
      isVerified: false,
    },
  });

  await sendEmail(email, OTP);

  return newUser;
};

export const login = async (bodyData) => {
  const { email, password } = bodyData;

  const user = await DBRepo.findOne({
    model: UserModel,
    filters: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password", {
      cause: { statusCode: 401 },
    });
  }

  const isMatchPassword = await compareOperation({
    plainText: password,
    hashedValue: user.password,
  });

  if (!isMatchPassword) {
    throw new Error("Invalid email or password", {
      cause: { statusCode: 401 },
    });
  }

  const secret = ROLE_SECRETS[user.role];

  const token = jwt.sign({ id: user._id }, secret, {
    expiresIn: JWT_EXPIRES_IN,
    audience: user.role,
  });

  return { message: "Logged user", token };
};

export const confirmOTP = async (bodyData, userId) => {
  const { otp } = bodyData;

  const objectId = new mongoose.Types.ObjectId(userId);

  const user = await DBRepo.findOne({
    model: UserModel,
    filters: { _id: objectId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.otp) {
    throw new Error("No OTP found");
  }

  if (user.isVerified) {
    throw new Error("User already verified");
  }

  if (user.otpExpiresAt < new Date()) {
    throw new Error("OTP expired");
  }

  const isMatch = await bcrypt.compare(otp, user.otp);

  if (!isMatch) {
    throw new Error("Invalid OTP");
  }

  // Success
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiresAt = undefined;

  await user.save();

  return { message: "Account verified successfully" };
};
