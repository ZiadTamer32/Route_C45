import { Router } from "express";
import { successResponse } from "../../Common/Response/response.js";
import * as authService from "./auth.service.js";
import { validation } from "../../Middleware/validationMiddleware.js";
import {
  confirmOTPSchema,
  loginSchema,
  resendOTPSchema,
  signupSchema,
  confirmLoginSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
} from "./auth.validation.js";
import { authentication } from "../../Middleware/authMiddleware.js";

const authRouter = Router();

authRouter.post("/signup", validation(signupSchema), async (req, res) => {
  const result = await authService.signup(req.body);
  return successResponse(res, 201, result);
});

authRouter.post("/login", validation(loginSchema), async (req, res) => {
  const result = await authService.login(req.body);
  return successResponse(res, 200, {
    msg: result.message,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

authRouter.post("/resendOTP", validation(resendOTPSchema), async (req, res) => {
  const result = await authService.resendOTP(req.body.email);
  return successResponse(res, 200, {
    msg: result.message,
  });
});

authRouter.post("/signup/gmail", async (req, res) => {
  const { statusCode, result } = await authService.gmailAuth(req.body.idToken);
  return successResponse(res, statusCode, result);
});

authRouter.patch(
  "/enableTwoStepVerification",
  authentication,
  async (req, res) => {
    const result = await authService.enableTwoStepVerification(req.user.id);
    return successResponse(res, 200, {
      msg: result.message,
    });
  },
);

authRouter.patch(
  "/disableTwoStepVerification",
  authentication,
  async (req, res) => {
    const result = await authService.disableTwoStepVerification(req.user.id);
    return successResponse(res, 200, {
      msg: result.message,
    });
  },
);

authRouter.post(
  "/confirmLogin",
  validation(confirmLoginSchema),
  async (req, res) => {
    const result = await authService.confirmLogin(req.body);
    return successResponse(res, 200, {
      msg: result.message,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  },
);

authRouter.post(
  "/forgetPassword",
  validation(forgetPasswordSchema),
  async (req, res) => {
    const result = await authService.forgetPassword(req.body);
    return successResponse(res, 200, result.message);
  },
);

authRouter.post(
  "/confirmEmail/:userId",
  validation(confirmOTPSchema),
  async (req, res) => {
    const result = await authService.confirmVerifyEmail(
      req.body,
      req.params.userId,
    );
    return successResponse(res, 200, {
      msg: result.message,
    });
  },
);

authRouter.post(
  "/resetPassword/:token",
  validation(resetPasswordSchema),
  async (req, res) => {
    const result = await authService.resetPassword(req.body, req.params.token);
    return successResponse(res, 200, result.message);
  },
);

export default authRouter;
