import { Router } from "express";
import { successResponse } from "../../Common/Response/response.js";
import { authMiddleware } from "../../Common/authMiddleware.js";
import * as userService from "./user.service.js";

const userRouter = Router();

userRouter.get("/", authMiddleware, async (req, res) => {
  const result = await userService.getUser(req.user.id);
  return successResponse(res, 200, result);
});

export default userRouter;
