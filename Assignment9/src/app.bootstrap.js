import express from "express";
import cookieParser from "cookie-parser";
import { PORT } from "../config/app.config.js";
import { globalErrorHandling } from "./Common/Response/response.js";
import testDbConnection from "./DB/connection.js";
import userRouter from "./Modules/Users/user.controller.js";
import noteRouter from "./Modules/Notes/note.controller.js";
const bootstrap = () => {
  const app = express();

  testDbConnection();

  app.use(cookieParser());

  app.use(express.json());

  app.use("/users", userRouter);
  app.use("/notes", noteRouter);

  app.use(globalErrorHandling);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

export default bootstrap;
