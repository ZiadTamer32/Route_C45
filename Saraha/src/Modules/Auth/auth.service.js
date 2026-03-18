import * as DBRepo from "../../DB/db.repository.js";
import jwt from "jsonwebtoken";
import sendEmail from "../../Common/sendEmail.js";
import { randomInt, randomUUID } from "crypto";
import { UserModel } from "../../DB/Models/UserModel.js";
import { compareOperation, hashOperation } from "../../Common/Security/hash.js";
import { encryption } from "../../Common/Security/crypto.js";
import { JWT_EXPIRES_IN, WEB_CLIENT_ID } from "../../../config/app.config.js";
import { ROLE_SECRETS } from "../../Common/constans.js";
import { ProviderEnum, TokenEnum } from "../../Common/Enums/enums.js";
import { OAuth2Client } from "google-auth-library";

const generateTokens = (user) => {
  const accessSign = ROLE_SECRETS[user.role][0];
  const refreshSign = ROLE_SECRETS[user.role][1];

  const tokenId = randomUUID();

  const accessToken = jwt.sign({ id: user._id }, accessSign, {
    expiresIn: JWT_EXPIRES_IN,
    audience: [user.role, TokenEnum.access],
    jwtid: tokenId,
  });

  const refreshToken = jwt.sign({ id: user._id }, refreshSign, {
    expiresIn: "1y",
    audience: [user.role, TokenEnum.refresh],
    jwtid: tokenId,
  });

  return {
    accessToken,
    refreshToken,
  };
};

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

  const OTP = randomInt(100000, 1000000).toString();

  const hashedOTP = await hashOperation({ plainText: OTP });

  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

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

  const { accessToken, refreshToken } = generateTokens(user);

  return { message: "Logged user", accessToken, refreshToken };
};

export const confirmOTP = async (bodyData, userId) => {
  const { otp } = bodyData;

  const user = await DBRepo.findById({
    model: UserModel,
    id: userId,
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
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();
    throw new Error("OTP expired");
  }

  const isMatch = await compareOperation({
    plainText: otp,
    hashedValue: user.otp,
  });

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

const verifyTokenGmail = async (idToken) => {
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: WEB_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  return payload;
};

const getOrCreateGmailUser = async (resultPayload) => {
  const user = await DBRepo.findOne({
    model: UserModel,
    filters: { email: resultPayload.email },
  });

  if (user) {
    if (user.provider === ProviderEnum.system) {
      throw new Error("Email already exists", { cause: { statusCode: 409 } });
    }
    return { user, isNew: false };
  }

  const newUser = await DBRepo.create({
    model: UserModel,
    bodyData: {
      email: resultPayload.email,
      isVerified: resultPayload.email_verified,
      userName:
        `${resultPayload.given_name ?? ""} ${resultPayload.family_name ?? ""}`.trim(),
      provider: ProviderEnum.google,
      profilePic: resultPayload.picture,
    },
  });

  return { user: newUser, isNew: true };
};

export const gmailAuth = async (idToken) => {
  const resultPayload = await verifyTokenGmail(idToken);

  if (!resultPayload.email_verified) {
    throw new Error("Email not verified with Google", {
      cause: { statusCode: 401 },
    });
  }

  const { user, isNew } = await getOrCreateGmailUser(resultPayload);

  const { accessToken, refreshToken } = generateTokens(user);

  const statusCode = isNew ? 201 : 200;

  return {
    statusCode,
    result: { statusCode, user, accessToken, refreshToken },
  };
};
