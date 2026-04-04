import { connect } from "mongoose";
import { DB_URL, NODE_ENV } from "../../config/app.config.js";

export async function testDbConnection() {
  try {
    await connect(DB_URL);
    if (NODE_ENV === "dev") {
      console.log("Database connected successfully");
    }
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
}

export default testDbConnection;
