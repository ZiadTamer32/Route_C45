import Joi from "joi";
import { GenderEnum, RoleEnum } from "../../Common/Enums/enums.js";

export const signupSchema = {
  body: Joi.object({
    userName: Joi.string().alphanum().min(3).max(15).trim().required(),

    email: Joi.string()
      .trim()
      .lowercase()
      .pattern(/^[a-zA-Z0-9._%+-]+@(gmail|yahoo|hotmail|outlook)\.(com|net)$/)
      .required(),

    password: Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      )
      .required(),

    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),

    phone: Joi.string().pattern(/^01[0125][0-9]{8}$/),

    gender: Joi.string()
      .valid(...Object.values(GenderEnum))
      .lowercase(),

    role: Joi.string()
      .valid(...Object.values(RoleEnum))
      .lowercase()
      .default(RoleEnum.user),

    profilePic: Joi.string().uri(),

    DOB: Joi.date().less("now"),
  }),
};

export const loginSchema = {
  body: Joi.object({
    email: Joi.string()
      .trim()
      .lowercase()
      .pattern(/^[a-zA-Z0-9._%+-]+@(gmail|yahoo|hotmail|outlook)\.(com|net)$/),

    userName: Joi.string().alphanum().min(3).max(15).trim(),

    password: Joi.string().required(),
  }).xor("email", "userName"),
};
