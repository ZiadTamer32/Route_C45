import Joi from "joi";
import { objectIdValidator } from "../../Middleware/validationMiddleware.js";

export const sendMessageSchema = {
  body: Joi.object({
    content: Joi.string().min(3).max(1000).required(),
  }),
  params: Joi.object({
    receiverId: objectIdValidator.required(),
  }),
};

export const messageIdSchema = {
  params: Joi.object({
    messageId: objectIdValidator.required(),
  }),
};
