import { Router } from "express";
import { successResponse } from "../../Common/Response/response.js";
import * as authService from "./auth.service.js";
const authRouter = Router();

authRouter.post("/signup", async (req, res) => {
  const result = await authService.signup(req.body);
  return successResponse(res, 200, result);
});
authRouter.post("/login", async (req, res) => {
  const result = await authService.login(req.body);
  return successResponse(res, 200, {
    msg: result.message,
    token: result.token,
  });
});
authRouter.post("/confirmEmail/:userId", async (req, res) => {
  const result = await authService.confirmOTP(req.body, req.params.userId);
  return successResponse(res, 200, {
    msg: result.message,
  });
});

export default authRouter;
