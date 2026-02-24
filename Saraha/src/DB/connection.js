import { connect } from "mongoose";
import { DB_URL } from "../../config/app.config.js";

const testDbConnection = () => {
  connect(DB_URL)
    .then(() => {
      console.log("Database connected successfully");
    })
    .catch((error) => {
      console.error("Database connection failed:", error.message);
    });
};

export default testDbConnection;
