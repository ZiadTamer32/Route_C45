import express from "express";
import cors from "cors";
import path from "node:path";
import cron from "node-cron";

import { PORT } from "../config/app.config.js";
import { deleteUnConfirmEmail } from "./Modules/Auth/auth.service.js";
import { globalErrorHandling } from "./Common/Response/response.js";
import testDbConnection from "./DB/connection.js";
import authRouter from "./Modules/Auth/auth.controller.js";
import userRouter from "./Modules/User/user.controller.js";
import { testRedisConnection } from "./DB/redis.connection.js";

const bootstrap = async () => {
  const app = express();

  await testDbConnection();
  await testRedisConnection();

  app.use(cors());
  app.use(express.json());

  app.use("/uploads", express.static(path.resolve("./uploads")));

  app.use("/auth", authRouter);
  app.use("/user", userRouter);

  app.use(globalErrorHandling);

  // CRON Job that runs periodically (every day at 12 AM) to delete expired unconfirmed users
  cron.schedule("0 0 * * *", async () => {
    console.log("Running scheduled task to delete unconfirmed users...");
    await deleteUnConfirmEmail();
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

export default bootstrap;
