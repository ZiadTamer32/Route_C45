import rateLimit from "express-rate-limit";
import { ipKeyGenerator } from "express-rate-limit";
import geoip from "geoip-lite";
import * as redisMethods from "../../DB/redis.repository.js";

export const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: (req) => {
    const geoInfo = geoip.lookup(req.ip);
    return geoInfo?.country === "EG" ? 10 : 1;
  },
  handler: (req, res) => {
    res
      .status(429)
      .json({ errMsg: "Too many requests, please try again later" });
  },
  requestPropertyName: "rateLimit",
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req.ip);
    return `ip:${ip}-${req.path}`;
  },
  store: {
    async incr(key, cb) {
      const hits = await redisMethods.incr(key);
      if (hits === 1) {
        await redisMethods.expire(key, 5 * 60);
      }
      cb(null, hits);
    },
    async decrement(key, cb) {
      const isExist = await redisMethods.exists(key);
      if (isExist) {
        await redisMethods.decr(key);
      }
      cb(null);
    },
  },
  legacyHeaders: false,
  // skipSuccessfulRequests: true,
});
