import { Router } from "express";
import {
  createCappedCollection,
  createLog,
  lookupLogs,
} from "./logs.service.js";

const logsRouter = Router();

logsRouter.post("/capped", async (req, res) => {
  const result = await createCappedCollection();
  return res.status(200).json({ message: "Capped collection created", result });
});

logsRouter.post("/", async (req, res) => {
  const result = await createLog(req.body);
  return res.status(201).json({ result });
});

logsRouter.get("/aggregate4", async (req, res) => {
  const result = await lookupLogs();
  return res.status(200).json({ result });
});

export default logsRouter;
