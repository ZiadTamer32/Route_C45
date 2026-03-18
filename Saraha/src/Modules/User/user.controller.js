import { Router } from "express";
import { successResponse } from "../../Common/Response/response.js";
import {
  authentication,
  authorization,
} from "../../Common/Middleware/authMiddleware.js";
import * as userService from "./user.service.js";
import { validation } from "../../Common/Middleware/validationMiddleware.js";
import {
  updateCoverPicsSchema,
  updateProfileSchema,
  userIdParamSchema,
} from "./user.validation.js";
import { localMulter } from "../../Common/Middleware/multerMiddleware.js";

const userRouter = Router();

userRouter.get(
  "/",
  authentication,
  authorization("user", "admin"),
  async (req, res) => {
    const result = await userService.getUser(req.user.id, req.user.aud[0]);
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

userRouter.post(
  "/updateCoverPics",
  authentication,
  localMulter({ folderName: "user" }).array("coverPics"),
  validation(updateCoverPicsSchema),
  async (req, res) => {
    const result = await userService.updateCoverPics(req.user.id, req.files);
    return successResponse(res, 200, result.msg);
  },
);

userRouter.post("/logout", authentication, async (req, res) => {
  const result = await userService.logout(req.user, req.body.options);
  return successResponse(res, 200, result);
});

userRouter.post(
  "/updateProfile",
  authentication,
  localMulter({ folderName: "user", limits: 2 * 1024 * 1024 }).single(
    "profilePic",
  ),
  validation(updateProfileSchema),
  async (req, res) => {
    const result = await userService.updateProfilePic(
      req.user.id,
      req.file.finalPath,
    );
    return successResponse(res, 200, result.msg);
  },
);

userRouter.patch("/deleteProfilePic", authentication, async (req, res) => {
  const result = await userService.deleteProfilePic(req.user.id);
  return successResponse(res, 200, result);
});

userRouter.get(
  "/shareProfile/:userId",
  validation(userIdParamSchema),
  async (req, res) => {
    const result = await userService.shareProfile(req.params.userId);
    return successResponse(res, 200, result);
  },
);

userRouter.patch(
  "/visitProfile/:userId",
  authentication,
  validation(userIdParamSchema),
  async (req, res) => {
    const result = await userService.visitProfile(
      req.user.id,
      req.params.userId,
    );
    return successResponse(res, result.status, result.msg);
  },
);

export default userRouter;
