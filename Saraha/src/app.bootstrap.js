import express from "express";
import cors from "cors";
import { PORT } from "../config/app.config.js";
import { globalErrorHandling } from "./Common/Response/response.js";
import testDbConnection from "./DB/connection.js";
import authRouter from "./Modules/Auth/auth.controller.js";
import userRouter from "./Modules/User/user.controller.js";

const bootstrap = () => {
  const app = express();

  testDbConnection();

  app.use(cors());
  app.use(express.json());

  app.use("/auth", authRouter);
  app.use("/user", userRouter);

  app.use(globalErrorHandling);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

export default bootstrap;
