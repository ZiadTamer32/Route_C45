import { Router } from "express";
import { createImplicityAuthor } from "./authors.service.js";

const authorsRouter = Router();

authorsRouter.post("/create-implicity", async (req, res) => {
  const result = await createImplicityAuthor();
  return res.status(201).json({ result });
});

export default authorsRouter;
