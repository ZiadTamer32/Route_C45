import { MongoClient } from "mongodb";
import { DB_NAME, DB_URL, NODE_ENV } from "../../config/app.config.js";

// Connection URL
const url = DB_URL;
const client = new MongoClient(url);

// Database Name
const dbName = DB_NAME;
export const db = client.db(dbName);

export async function testDbConnection() {
  // Use connect method to connect to the server
  try {
    await client.connect();
    if (NODE_ENV === "dev") {
      console.log("Connected successfully to server");
    } else {
      console.log("Connected successfully to production server");
    }
  } catch (error) {
    console.log(error);
  }
}
