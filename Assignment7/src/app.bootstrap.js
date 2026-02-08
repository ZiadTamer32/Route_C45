import express from "express";
import { NODE_ENV, PORT } from "../config/app.config.js";
import { testDbConnection } from "./DB/connection.js";
import booksRouter from "./Modules/Books/books.controller.js";
import authorsRouter from "./Modules/Authors/authors.controller.js";
import logsRouter from "./Modules/Logs/logs.controller.js";
const bootstrap = async () => {
  const app = express();

  await testDbConnection();

  app.use(express.json());

  app.use("/collection/books", booksRouter);
  app.use("/collection/authors", authorsRouter);
  app.use("/collection/logs", logsRouter);

  app.use((error, req, res, next) => {
    return NODE_ENV === "dev"
      ? res.status(error.cause?.statusCode ?? 500).json({
          errMsg: error.message,
          error,
          stack: error.stack,
        })
      : res.status(error.cause?.statusCode ?? 500).json({
          errMsg: error.message || "Something went wrong",
        });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

export default bootstrap;
