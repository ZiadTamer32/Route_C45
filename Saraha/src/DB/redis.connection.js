import { createClient } from "redis";
import { NODE_ENV, REDIS_URL } from "../../config/app.config.js";

export const client = createClient({
  url: REDIS_URL,
});

client.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

export async function testRedisConnection() {
  try {
    await client.connect();
    if (NODE_ENV === "dev") {
      console.log("Redis connected successfully");
    }
  } catch (error) {
    console.error("Redis connection failed:", error.message);
  }
}
