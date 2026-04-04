import { Router } from "express";
import { localMulter } from "../../Middleware/multerMiddleware.js";
import { badRequest, successResponse } from "../../Common/Response/response.js";
import { authentication } from "../../Middleware/authMiddleware.js";
import { validation } from "../../Middleware/validationMiddleware.js";
import { messageIdSchema, sendMessageSchema } from "./message.validation.js";
import * as messageService from "./message.service.js";

const messageRouter = Router();

messageRouter.post(
  "/:messageId",
  localMulter({ folderName: "messages", limits: 5 }).array("msgAttachments"),
  validation(sendMessageSchema),
  (req, res, next) => {
    if (req.headers.authorization) {
      return authentication(req, res, next).catch(next);
    }
    return next();
  },
  async (req, res) => {
    if (!req.body.content && req.files?.length === 0) {
      return badRequest(
        res,
        "Message must contain text content or at least one file",
      );
    }
    const result = await messageService.sendMessage(
      req.body.content,
      req.files,
      req.params.messageId,
      req.user?.id,
    );
    return successResponse(res, 200, result);
  },
);

messageRouter.get(
  "/get-message-by-id/:messageId",
  authentication,
  validation(messageIdSchema),
  async (req, res) => {
    const result = await messageService.getSpecificMessage(
      req.params.messageId,
      req.user?.id,
    );
    return successResponse(res, 200, result);
  },
);

messageRouter.get("/get-all-messages", authentication, async (req, res) => {
  const result = await messageService.getAllMessages(req.user?.id);
  return successResponse(res, 200, {
    totalMessages: result.length,
    messages: result,
  });
});

messageRouter.delete(
  "/delete-message/:messageId",
  authentication,
  validation(messageIdSchema),
  async (req, res) => {
    const result = await messageService.deleteMessage(
      req.params.messageId,
      req.user?.id,
    );
    return successResponse(res, 200, result);
  },
);

export default messageRouter;
