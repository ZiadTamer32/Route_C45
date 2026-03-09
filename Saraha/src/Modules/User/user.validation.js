import Joi from "joi";

export const getUserSchema = {
  params: Joi.object({
    userId: Joi.string().alphanum().length(24).required(),
  }),
};
