import jwt from "jsonwebtoken";
import path from "node:path";
import fs from "node:fs/promises";
import * as DBRepo from "../../DB/db.repository.js";
import * as redisMethods from "../../DB/redis.repository.js";
import { UserModel } from "../../DB/Models/UserModel.js";
import { decryption } from "../../Common/Security/crypto.js";
import { ROLE_SECRETS } from "../../Common/constans.js";
import { RoleEnum, TokenEnum } from "../../Common/Enums/enums.js";
import { JWT_EXPIRES_IN } from "../../../config/app.config.js";
import { compareOperation, hashOperation } from "../../Common/Security/hash.js";

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

// {
//   id: '69b746faa87ad16e7889fad5',
//   iat: 1774347207,
//   exp: 1774348107,
//   aud: [ 'admin', 'access' ],
//   jti: '279ea9a6-0f04-4c90-8742-0ce9d8731697'
// }

export const logout = async (tokenData, options) => {
  const { iat, jti, id, exp, aud } = tokenData;

  if (options === "all") {
    await DBRepo.updateOne({
      model: UserModel,
      filters: { _id: id },
      bodyData: { changeCreditTime: new Date() },
    });
  } else {
    const [, tokenType] = aud;
    const expDuration =
      tokenType === "access"
        ? exp - (Date.now() / 1000 - iat)
        : 60 * 60 * 24 * 365 - (Date.now() / 1000 - iat);

    await redisMethods.setString({
      key: `blackListToken::${id}::${jti}`,
      value: jti,
      expValue: expDuration,
    });
  }

  return "logout success";
};

export const updatePassword = async (tokenData, bodyData) => {
  const { currentPassword, newPassword } = bodyData;
  const { id, jti, exp } = tokenData;

  const user = await DBRepo.findById({
    model: UserModel,
    id,
  });

  if (!user) {
    throw new Error("User not found", { cause: { statusCode: 401 } });
  }

  // 1. Verify that the current password provided is correct
  const isMatchPassword = await compareOperation({
    plainText: currentPassword,
    hashedValue: user.password,
  });

  if (!isMatchPassword) {
    throw new Error("Invalid current password", { cause: { statusCode: 401 } });
  }

  // 2. Ensure the new password is not the same as the current one
  const isSamePassword = await compareOperation({
    plainText: newPassword,
    hashedValue: user.password,
  });

  if (isSamePassword) {
    throw new Error("New password cannot be the same as current password", {
      cause: { statusCode: 400 },
    });
  }

  // 3. Hash the new password and update the user record
  const hashedPassword = await hashOperation({ plainText: newPassword });

  user.password = hashedPassword;
  user.changeCreditTime = new Date();
  await user.save();

  return { msg: "Password updated successfully" };
};
