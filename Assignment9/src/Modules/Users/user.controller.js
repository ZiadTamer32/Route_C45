import { Router } from "express";
import * as userService from "./user.service.js";
import { successResponse } from "../../Common/Response/response.js";
import { isAuth } from "../../utils/authMiddleware.js";

const userRouter = Router();

userRouter.post("/signup", async (req, res) => {
  const result = await userService.signup(req.body);
  return successResponse(res, 201, result);
});
userRouter.post("/login", async (req, res) => {
  const result = await userService.login(req.body, res);
  return successResponse(res, 201, { token: result.token });
});
userRouter.patch("/", isAuth, async (req, res) => {
  const result = await userService.updateUser(req.userId, req.body);
  return successResponse(res, 200, result);
});
userRouter.delete("/", isAuth, async (req, res) => {
  const result = await userService.deleteUser(req.userId);
  return successResponse(res, 200, result);
});
userRouter.get("/", isAuth, async (req, res) => {
  const result = await userService.getUser(req.userId);
  return successResponse(res, 200, result);
});

export default userRouter;
