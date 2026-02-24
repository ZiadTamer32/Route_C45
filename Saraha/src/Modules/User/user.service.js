import mongoose from "mongoose";
import * as DBRepo from "../../DB/db.repository.js";
import { UserModel } from "../../DB/Models/UserModel.js";
import { decryption } from "../../Common/Security/crypto.js";

export const getUser = async (userId) => {
  const objectId = new mongoose.Types.ObjectId(userId);

  const user = await DBRepo.findOne({
    model: UserModel,
    filters: { _id: objectId },
  });

  if (!user) {
    throw new Error("User not found", { cause: { statusCode: 404 } });
  }

  user.phone = decryption(user.phone);

  return user;
};
