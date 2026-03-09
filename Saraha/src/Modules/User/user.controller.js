import { Router } from "express";
import { successResponse } from "../../Common/Response/response.js";
import {
  authentication,
  authorization,
} from "../../Common/Middleware/authMiddleware.js";
import * as userService from "./user.service.js";
import validation from "../../Common/Middleware/validationMiddleware.js";
import { getUserSchema } from "./user.validation.js";

const userRouter = Router();

userRouter.get(
  "/",
  authentication,
  authorization("user", "admin"),
  validation(getUserSchema),
  async (req, res) => {
    const result = await userService.getUser(req.user.id);
    return successResponse(res, 200, result);
  },
);
userRouter.post("/renew-token", authentication, async (req, res) => {
  const result = await userService.renewToken(req.user);
  return successResponse(res, 200, {
    message: result.msg,
    newAccessToken: result.newAccessToken,
  });
});

export default userRouter;
