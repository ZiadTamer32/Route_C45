import { z } from "zod";
import { GenderEnum } from "../../Common/enums/index.js";
import { commonValidation } from "../../MiddleWares/validationMiddleware.js";

export const signupSchema = {
  body: z
    .object({
      userName: commonValidation.userName,
      email: commonValidation.email,
      gender: z.enum(GenderEnum, "Invalid gender"),
      phone: commonValidation.phone,
      DOB: z.date().optional(),
      password: commonValidation.password,
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
};

export const loginSchema = {
  body: z.object({
    email: commonValidation.email,
    password: commonValidation.password,
  }),
};
