import * as DBRepo from "../../DB/db.repository.js";
import * as redisMethods from "../../DB/redis.repository.js";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { UserModel } from "../../DB/Models/UserModel.js";
import { compareOperation, hashOperation } from "../../Common/Security/hash.js";
import { encryption } from "../../Common/Security/crypto.js";
import {
  JWT_EXPIRES_IN,
  JWT_SECRET_USER,
  WEB_CLIENT_ID,
} from "../../../config/app.config.js";
import {
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  ROLE_SECRETS,
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
} from "../../Common/constans.js";
import { ProviderEnum, TokenEnum } from "../../Common/Enums/enums.js";
import { OAuth2Client } from "google-auth-library";
import sendOTP from "../../Common/Mails/sendOTP.js";
import attempts from "../../Common/Security/attempts.js";
import sendEmail from "../../Common/Mails/sendEmail.js";

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

  const newUser = await DBRepo.create({
    model: UserModel,
    bodyData: {
      ...bodyData,
      password: hashedPassword,
      phone: phoneEncrypted,
    },
  });

  await sendOTP({
    email,
    subject: "Verify your email",
    template: VERIFICATION_EMAIL_TEMPLATE,
  });

  return newUser;
};

export const login = async (bodyData) => {
  const { email, password } = bodyData;

  const isBlocked = await redisMethods.getString(`BLOCK::${email}::login`);
  if (isBlocked) {
    throw new Error(`Too many attempts. Please try again in 5 minutes.`, {
      cause: { statusCode: 429 },
    });
  }

  const user = await DBRepo.findOne({
    model: UserModel,
    filters: { email },
  });

  if (!user) {
    // Block after 3 attempts --> 5 min
    await attempts({
      email,
      expireAt: 60 * 5,
      numOfAttempts: 4,
      type: "login",
    });
    throw new Error("Invalid email or password", {
      cause: { statusCode: 401 },
    });
  }

  const isMatchPassword = await compareOperation({
    plainText: password,
    hashedValue: user.password,
  });

  if (!isMatchPassword) {
    await attempts({
      email: user.email,
      expireAt: 60 * 5,
      numOfAttempts: 5,
      type: "login",
    });
    throw new Error("Invalid email or password", {
      cause: { statusCode: 401 },
    });
  }

  // Clear failed attempts counter on succesful password match
  await redisMethods.del(`ATTEMPT::${user.email}::login`);

  if (!user.isVerified) {
    throw new Error("Please verify your email first", {
      cause: { statusCode: 401 },
    });
  }

  if (user.twoStepVerification) {
    await sendOTP({
      email: user.email,
      subject: "Login-2-step-verification",
      template: VERIFICATION_EMAIL_TEMPLATE,
    });
    return {
      message: "OTP sent to your email. Please verify to complete login.",
    };
  }

  const { accessToken, refreshToken } = generateTokens(user);

  return { message: "Logged user", accessToken, refreshToken };
};

const confirmOTP = async (bodyData, filters, type) => {
  const { otp } = bodyData;

  const user = await DBRepo.findOne({
    model: UserModel,
    filters,
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.isVerified && type === "Verify_your_email") {
    throw new Error("Account already verified", { cause: { statusCode: 400 } });
  }

  const OTPKey = `OTP::${user.email}::${type}`;
  const isVerified = await redisMethods.getString(OTPKey);

  if (!isVerified) {
    throw new Error("OTP expired", {
      cause: { statusCode: 401 },
    });
  }

  const isMatch = await compareOperation({
    plainText: otp,
    hashedValue: isVerified,
  });

  if (!isMatch) {
    throw new Error("Invalid OTP");
  }

  // Success
  if (type === "Verify_your_email") {
    user.isVerified = true;
    await user.save();
  }

  await redisMethods.del(OTPKey);

  return { message: "Account verified successfully" };
};

export const confirmVerifyEmail = async (bodyData, userId) => {
  return confirmOTP(bodyData, { _id: userId }, "Verify_your_email");
};

export const resendOTP = async (email) => {
  const user = await DBRepo.findOne({
    model: UserModel,
    filters: { email },
  });

  if (!user) {
    throw new Error("User not found", { cause: { statusCode: 404 } });
  }

  if (user.isVerified) {
    throw new Error("Account already verified", { cause: { statusCode: 400 } });
  }

  const OTPKey = `OTP::${user.email}::Verify_your_email`;
  const isVerified = await redisMethods.getString(OTPKey);

  if (isVerified) {
    throw new Error(
      "OTP already sent, check your email, you can resend it after 5 minutes",
      { cause: { statusCode: 400 } },
    );
  }

  // Block after 3 attempts --> 5 min
  await attempts({
    email: user.email,
    expireAt: 60 * 5,
    numOfAttempts: 3,
    type: "Verify_your_email",
  });

  // Send OTP after passing all checks
  await sendOTP({
    email,
    subject: "Verify your email",
    template: VERIFICATION_EMAIL_TEMPLATE,
  });

  return { message: "OTP sent successfully" };
};

const verifyTokenGmail = async (idToken) => {
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken,
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

export const enableTwoStepVerification = async (userId) => {
  const user = await DBRepo.findById({
    model: UserModel,
    id: userId,
  });

  if (!user) {
    throw new Error("User not found", { cause: { statusCode: 404 } });
  }

  if (user.twoStepVerification) {
    throw new Error("2-step-verification is already enabled", {
      cause: { statusCode: 400 },
    });
  }

  user.twoStepVerification = true;
  await user.save();

  return { message: "2-step-verification enabled successfully" };
};

export const confirmLogin = async (bodyData) => {
  const { email } = bodyData;

  await confirmOTP(bodyData, { email }, "Login-2-step-verification");

  const user = await DBRepo.findOne({
    model: UserModel,
    filters: { email },
  });

  const { accessToken, refreshToken } = generateTokens(user);

  return {
    message: "Logged in successfully",
    accessToken,
    refreshToken,
  };
};

export const disableTwoStepVerification = async (userId) => {
  const user = await DBRepo.findById({
    model: UserModel,
    id: userId,
  });

  if (!user) {
    throw new Error("User not found", { cause: { statusCode: 404 } });
  }

  if (!user.twoStepVerification) {
    throw new Error("2-step-verification is already disabled", {
      cause: { statusCode: 400 },
    });
  }

  user.twoStepVerification = false;
  await user.save();

  return { message: "2-step-verification disabled successfully" };
};

export const forgetPassword = async (bodyData) => {
  const { email } = bodyData;
  const user = await DBRepo.findOne({
    model: UserModel,
    filters: { email, isVerified: true },
  });

  if (!user) {
    return { message: "If this email exists, a reset link has been sent" };
  }

  const resetToken = jwt.sign({ email: user.email }, JWT_SECRET_USER, {
    expiresIn: "10m",
  });

  await redisMethods.setString({
    key: `passwordResetToken::${user.email}`,
    value: `${resetToken}`,
    expValue: 60 * 10,
  });

  await sendEmail({
    to: user.email,
    subject: "Reset your password",
    html: PASSWORD_RESET_REQUEST_TEMPLATE.replace(
      "{resetURL}",
      `http://localhost:5173/reset-password/${resetToken}`,
    ),
  });

  return { message: "If this email exists, a reset link has been sent" };
};

export const resetPassword = async (bodyData, token) => {
  const { newPassword } = bodyData;
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET_USER);
  } catch (err) {
    throw new Error("Invalid or expired token", { cause: { statusCode: 401 } });
  }

  const { email } = decoded;

  const storedToken = await redisMethods.getString(
    `passwordResetToken::${email}`,
  );

  if (!storedToken || storedToken !== token) {
    throw new Error("Invalid or expired token", { cause: { statusCode: 401 } });
  }

  const user = await DBRepo.findOne({
    model: UserModel,
    filters: { email },
  });

  if (!user) {
    throw new Error("User not found", { cause: { statusCode: 404 } });
  }

  user.password = await hashOperation({ plainText: newPassword });
  user.changeCreditTime = new Date();
  await user.save();

  await redisMethods.del(`passwordResetToken::${email}`);

  await sendEmail({
    to: user.email,
    subject: "Password reset successfully",
    html: PASSWORD_RESET_SUCCESS_TEMPLATE,
  });

  return { message: "Password reset successfully" };
};

export const deleteUnConfirmEmail = async () => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await DBRepo.deleteMany({
    model: UserModel,
    filters: {
      isVerified: false,
      createdAt: { $lt: twentyFourHoursAgo },
    },
  });
};
