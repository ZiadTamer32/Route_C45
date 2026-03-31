import { Types } from "mongoose";
import { badRequest } from "../Common/Response/response.js";
import Joi from "joi";

export function validation(schema) {
  return (req, res, next) => {
    const validationErrors = {};
    for (const key of Object.keys(schema)) {
      const { value, error } = schema[key].validate(req[key], {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        error.details.forEach((err) => {
          validationErrors[err.path.join(".")] = err.message;
        });
      } else {
        req[key] = value;
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      return badRequest(res, validationErrors);
    }

    next();
  };
}

export const objectIdValidator = Joi.string()
  .custom((value, helpers) => {
    if (!Types.ObjectId.isValid(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  })
  .messages({ "any.invalid": "Invalid MongoDB ObjectId format" });
