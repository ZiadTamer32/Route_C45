import { Router } from "express";
import { successResponse } from "../../Common/Response/response.js";
import { isAuth } from "../../utils/authMiddleware.js";
import * as noteService from "./note.service.js";

const noteRouter = Router();

noteRouter.post("/", isAuth, async (req, res) => {
  const result = await noteService.createNote(req.userId, req.body);
  return successResponse(res, 201, result);
});
noteRouter.get("/paginate-sort", isAuth, async (req, res) => {
  const result = await noteService.getNotes(req.userId, req.query);
  return successResponse(res, 200, result);
});
noteRouter.patch("/all", isAuth, async (req, res) => {
  const result = await noteService.updateAllTitle(req.userId, req.body);
  return successResponse(res, 200, result);
});
noteRouter.get("/note-by-content", isAuth, async (req, res) => {
  const result = await noteService.getNotesByContent(req.userId, req.query);
  return successResponse(res, 200, result);
});
noteRouter.get("/note-with-user", isAuth, async (req, res) => {
  const result = await noteService.getUserNotesWithUserInfo(req.userId);
  return successResponse(res, 200, result);
});
noteRouter.get("/aggregate", isAuth, async (req, res) => {
  const result = await noteService.getUserNotesByTitle(req.userId, req.query);
  return successResponse(res, 200, result);
});
noteRouter.delete("/", isAuth, async (req, res) => {
  const result = await noteService.deleteAllUserNotes(req.userId);
  return successResponse(res, 200, result);
});
noteRouter.patch("/replace/:noteId", isAuth, async (req, res) => {
  const result = await noteService.replaceNote(
    req.userId,
    req.params,
    req.body,
  );
  return successResponse(res, 200, result);
});

noteRouter.patch("/:noteId", isAuth, async (req, res) => {
  const result = await noteService.updateNote(req.userId, req.params, req.body);
  return successResponse(res, 200, result);
});
noteRouter.get("/:noteId", isAuth, async (req, res) => {
  const result = await noteService.getSpecificId(req.userId, req.params.noteId);
  return successResponse(res, 200, result);
});

noteRouter.delete("/:noteId", isAuth, async (req, res) => {
  const result = await noteService.deleteNote(req.userId, req.params.noteId);
  return successResponse(res, 200, result);
});

export default noteRouter;
