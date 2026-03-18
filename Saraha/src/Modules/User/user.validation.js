import Joi from "joi";
import { objectIdValidator } from "../../Common/Middleware/validationMiddleware.js";

export const userIdParamSchema = {
  params: Joi.object({
    userId: objectIdValidator.required(),
  }),
};

export const updateProfileSchema = {
  file: Joi.object().required().messages({
    "any.required": "Profile picture is required",
  }),
};

export const updateCoverPicsSchema = {
  files: Joi.array().min(1).max(2).required().messages({
    "array.min": "At least one cover picture is required",
    "array.max": "Cannot upload more than 2 cover pictures",
    "any.required": "Cover pictures are required",
  }),
};
