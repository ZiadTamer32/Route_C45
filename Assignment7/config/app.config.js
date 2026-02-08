import { config } from "dotenv";
import path from "path";

const appConfig = {
  dev: ".env.dev",
  prod: ".env.prod",
};

config({
  path: path.resolve(`./config/${appConfig[process.env.NODE_ENV || "dev"]}`),
});

export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || "";
export const DB_URL = process.env.DB_URL || "";
export const DB_NAME = process.env.DB_NAME || "";
