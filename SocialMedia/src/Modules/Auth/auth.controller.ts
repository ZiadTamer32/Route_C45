import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import * as AuthService from "../Auth/auth.service.js";
import { successResponse } from "../../Common/response/response.js";
import { validation } from "../../MiddleWares/validationMiddleware.js";
import { signupSchema, loginSchema } from "../Auth/auth.validation.js";
import type { IUser, IRequest } from "../../Common/interface/index.js";
import { authentication } from "../../MiddleWares/authMiddleware.js";

const authController = Router();

authController.post(
  "/signup",
  validation(signupSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await AuthService.signup(req.body);
    return successResponse<IUser>({ res, data: result });
  },
);

authController.post(
  "/login",
  validation(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await AuthService.login(req.body);
    return successResponse<{ user: IUser; token: string }>({
      res,
      data: result,
    });
  },
);

authController.get(
  "/",
  authentication,
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await AuthService.getUser(
      (req as IRequest).user!.id as string,
    );
    return successResponse<IUser>({ res, data: result });
  },
);

export default authController;
