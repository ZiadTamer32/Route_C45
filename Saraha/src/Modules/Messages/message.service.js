import * as DBRepo from "../../DB/db.repository.js";
import { MessageModel } from "../../DB/Models/MessageModel.js";
import { UserModel } from "../../DB/Models/UserModel.js";

export const sendMessage = async (content, files, receiverId, senderId) => {
  const user = await DBRepo.findById({ model: UserModel, id: receiverId });

  if (!user) {
    throw new Error("User not found", { cause: { statusCode: 404 } });
  }

  await DBRepo.create({
    model: MessageModel,
    bodyData: {
      content,
      attachments: files.map((file) => file.finalPath),
      receiverId,
      senderId,
    },
  });

  return "Message sent";
};

export const getSpecificMessage = async (messageId, userId) => {
  const message = await DBRepo.findById({
    model: MessageModel,
    id: messageId,
    select: "-senderId",
  });

  if (!message) {
    throw new Error("Message not found", { cause: { statusCode: 404 } });
  }

  if (message.receiverId.toString() !== userId.toString()) {
    throw new Error("Unauthorized", { cause: { statusCode: 401 } });
  }

  return message;
};

export const getAllMessages = async (userId) => {
  const messages = await DBRepo.find({
    model: MessageModel,
    filters: { $or: [{ receiverId: userId }, { senderId: userId }] },
    select: "-senderId",
  });

  return messages;
};

export const deleteMessage = async (messageId, userId) => {
  const message = await DBRepo.deleteOne({
    model: MessageModel,
    filters: { _id: messageId, receiverId: userId },
  });

  if (!message.deletedCount) {
    throw new Error("Message not found or unauthorized", {
      cause: { statusCode: 404 },
    });
  }

  return "Message deleted";
};
