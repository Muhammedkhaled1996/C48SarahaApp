import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import geoip from "geoip-lite";
import { successResponce } from "./success.responce.js";
import { client } from "../../DB/redis.connection.js";

function fromWhere(ip) {
  try {
    return geoip.lookup(ip);
  } catch (error) {
    console.log({ error: error?.message, status: error?.status });
  }
}

export const generateLimiter = ({
  ttl = 15,
  limit = 1000,
  message = "Too many requests",
  status = 429,
  legacyHeaders = true,
  standardHeaders = "draft-6",
  skipSuccessfulRequests,
  skipFailedRequests,
}) => {
  return rateLimit({
    windowMs: ttl * 60 * 1000, // minutes
    limit: function (req) {
      const data = fromWhere(req.ip);
      // return data?.country == "EG" ? limit : 0;
      return limit;
    },
    handler: function (req, res, next) {
      return successResponce({ res, message, status });
    },
    standardHeaders,
    legacyHeaders,
    skipSuccessfulRequests,
    skipFailedRequests,
    keyGenerator: function (req) {
      const ip = ipKeyGenerator(req.ip, 52);
      return `${ip}::${req.path}`;
    },
    store: {
      // called by keyGenerator
      async incr(key, cb) {
        try {
          const count = await client.incr(key);
          if (count === 1) {
            await client.expire(key, ttl * 60);
          }
          cb(null, count);
        } catch (error) {
          cb(error);
        }
      },

      async decrement(key) {
        // called by skipFailedRequests : true
        // skipSuccessfulRequests : true
        if (await client.exists(key)) {
          await client.decr(key);
        }
      },
    },
  });
};
