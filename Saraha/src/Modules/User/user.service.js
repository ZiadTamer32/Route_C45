import jwt from "jsonwebtoken";
import path from "node:path";
import fs from "node:fs/promises";
import * as DBRepo from "../../DB/db.repository.js";
import { UserModel } from "../../DB/Models/UserModel.js";
import { decryption } from "../../Common/Security/crypto.js";
import { ROLE_SECRETS } from "../../Common/constans.js";
import { RoleEnum, TokenEnum } from "../../Common/Enums/enums.js";
import { JWT_EXPIRES_IN } from "../../../config/app.config.js";
import { TokenModel } from "../../DB/Models/TokenModel.js";

export const visitProfile = async (visitorId, profileId) => {
  if (visitorId.toString() === profileId.toString()) {
    return { status: 400, msg: "You can't visit your own profile" };
  }

  await DBRepo.updateOne({
    model: UserModel,
    filters: { _id: profileId },
    bodyData: { $inc: { visitCount: 1 } },
  });

  return { status: 200, msg: "Profile Visited" };
};

export const getUser = async (userId, role) => {
  const user = await DBRepo.findById({
    model: UserModel,
    id: userId,
    select: `-password -otp -__v -role -provider -otpExpiresAt -isVerified -createdAt -updatedAt ${role === RoleEnum.admin ? "" : "-visitCount"}`,
  });

  if (!user) {
    throw new Error("User not found", { cause: { statusCode: 404 } });
  }

  if (user.phone) {
    user.phone = decryption(user.phone);
  }

  return user;
};

export const renewToken = async (userData) => {
  const { aud } = userData;
  const [role] = aud;

  const accessSign = ROLE_SECRETS[role]?.[0];

  if (!accessSign) {
    throw new Error("Unknown role", { cause: { statusCode: 401 } });
  }

  const newAccessToken = jwt.sign({ id: userData.id }, accessSign, {
    expiresIn: JWT_EXPIRES_IN,
    audience: [role, TokenEnum.access],
  });

  return {
    msg: "Token renewed Successfuly",
    newAccessToken,
  };
};

export const updateProfilePic = async (userId, profilePic) => {
  const user = await DBRepo.findById({
    model: UserModel,
    id: userId,
  });

  await DBRepo.updateOne({
    model: UserModel,
    filters: { _id: userId },
    bodyData: {
      profilePic,
      gallery: [...user.gallery, user.profilePic],
    },
  });

  return { msg: "Profile Updated" };
};

export const updateCoverPics = async (userId, files) => {
  const coverPicsPaths = files.map((file) => file.finalPath);

  const user = await DBRepo.findById({
    model: UserModel,
    id: userId,
  });

  const numOfExistingCovers = (user.coverPics || []).length;
  const totalCovers = numOfExistingCovers + coverPicsPaths.length;

  if (totalCovers !== 2) {
    throw new Error(
      `Total cover pictures must equal 2. You have ${numOfExistingCovers} and uploaded ${coverPicsPaths.length}`,
    );
  }

  const finalCovers = [...coverPicsPaths, ...user.coverPics];

  await DBRepo.updateOne({
    model: UserModel,
    filters: { _id: userId },
    bodyData: { coverPics: finalCovers },
  });

  return { msg: "coverPics Updated" };
};

export const deleteProfilePic = async (userId) => {
  const user = await DBRepo.findById({
    model: UserModel,
    id: userId,
  });

  if (!user.profilePic) {
    throw new Error("No profile picture to delete");
  }

  await fs.unlink(path.resolve(user.profilePic));

  user.profilePic = undefined;
  await user.save();

  return { msg: "Profile picture deleted" };
};

export const shareProfile = async (userId) => {
  const user = await DBRepo.findById({
    model: UserModel,
    id: userId,
    select:
      "-password -otp -__v -role -provider -otpExpiresAt -isVerified -createdAt -updatedAt",
  });

  if (!user) {
    throw new Error("User not found", { cause: { statusCode: 404 } });
  }

  if (user.phone) {
    user.phone = decryption(user.phone);
  }

  return user;
};

export const logout = async (tokenData, options) => {
  const { iat, jti, id } = tokenData;
  if (options === "all") {
    await DBRepo.updateOne({
      model: UserModel,
      filters: { _id: id },
      bodyData: { changeCreditTime: new Date() },
    });
  } else {
    await DBRepo.create({
      model: TokenModel,
      bodyData: {
        jti,
        userId: id,
        expireAt: (iat + 60 * 60 * 24 * 365) * 1000,
      },
    });
  }

  return "logout success";
};
