import jwt from "jsonwebtoken";
import * as DBRepo from "../../DB/db.repository.js";
import { UserModel } from "../../DB/Models/UserModel.js";
import { decryption } from "../../Common/Security/crypto.js";
import { ROLE_SECRETS } from "../../Common/constans.js";
import { TokenEnum } from "../../Common/Enums/enums.js";
import { JWT_EXPIRES_IN } from "../../../config/app.config.js";

export const getUser = async (userId) => {
  const user = await DBRepo.findById({
    model: UserModel,
    id: userId,
    select: "-password -otp",
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
