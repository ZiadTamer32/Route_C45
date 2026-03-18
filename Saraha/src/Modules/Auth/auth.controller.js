import { Router } from "express";
import { successResponse } from "../../Common/Response/response.js";
import * as authService from "./auth.service.js";
import { validation } from "../../Common/Middleware/validationMiddleware.js";
import { loginSchema, signupSchema } from "./auth.validation.js";

const authRouter = Router();

authRouter.post("/signup", validation(signupSchema), async (req, res) => {
  const result = await authService.signup(req.body);
  return successResponse(res, 200, result);
});

authRouter.post("/login", validation(loginSchema), async (req, res) => {
  console.log({ "req from postman": req.body });

  const result = await authService.login(req.body);
  return successResponse(res, 200, {
    msg: result.message,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

authRouter.post("/signup/gmail", async (req, res) => {
  const { statusCode, result } = await authService.gmailAuth(req.body.idToken);
  return successResponse(res, statusCode, result);
});

authRouter.post("/confirmEmail/:userId", async (req, res) => {
  const result = await authService.confirmOTP(req.body, req.params.userId);
  return successResponse(res, 200, {
    msg: result.message,
  });
});

export default authRouter;
