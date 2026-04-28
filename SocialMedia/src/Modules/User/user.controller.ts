import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { authentication } from "../../MiddleWares/authMiddleware.js";
import userService from "./user.service.js";
import { successResponse } from "../../Common/response/response.js";
import { IRequest, IUser } from "../../Common/interface/index.js";
import { validation } from "../../MiddleWares/validationMiddleware.js";
import { logoutSchema, updatePasswordSchema } from "./user.validation.js";

const userController = Router();
const UserService = new userService();

userController.get(
  "/",
  authentication,
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.getUser(
      (req as IRequest).user!.id as string,
    );
    return successResponse<IUser>({ res, data: result });
  },
);

userController.post(
  "/logout",
  authentication,
  validation(logoutSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    await UserService.logout((req as IRequest).user!, req.body.options);
    return successResponse<{ message: string }>({
      res,
      message: "Logout success",
    });
  },
);

userController.patch(
  "/enableTwoStepVerification",
  authentication,
  async (req: Request, res: Response, next: NextFunction) => {
    await UserService.enableTwoStepVerification((req as IRequest).user!.id);
    return successResponse<{ message: string }>({
      res,
      message: "2-step-verification enabled successfully",
    });
  },
);

userController.patch(
  "/disableTwoStepVerification",
  authentication,
  async (req: Request, res: Response, next: NextFunction) => {
    await UserService.disableTwoStepVerification((req as IRequest).user!.id);
    return successResponse<{ message: string }>({
      res,
      message: "2-step-verification disabled successfully",
    });
  },
);

userController.patch(
  "/updatePassword",
  authentication,
  validation(updatePasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    await UserService.updatePassword((req as IRequest).user!.id, req.body);
    return successResponse<{ message: string }>({
      res,
      message: "Password updated successfully",
    });
  },
);

export default userController;
