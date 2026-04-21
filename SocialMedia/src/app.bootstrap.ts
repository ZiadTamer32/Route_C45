import express from "express";
import authController from "./Modules/Auth/auth.controller.js";
import { globalErrorHandling } from "./MiddleWares/errorMiddleware.js";
import { PORT } from "./config/app.config.js";
import testDbConnection from "./DB/connection.js";
async function bootstrap() {
  const app: express.Express = express();

  await testDbConnection();

  app.use(express.json());

  app.use("/auth", authController);

  app.use(
    "/*d",
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ): void => {
      res.status(404).json("Invalid URL or METHOD");
    },
  );

  app.use(globalErrorHandling);

  app.listen(PORT, () => {
    console.log(`App Running on port ${PORT}`);
  });
}

export default bootstrap;
