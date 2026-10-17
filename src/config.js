import { resolve } from "node:path";
import { config } from "dotenv";
export const NODE_ENV = process.env.NODE_ENV ?? "development";
config({ path: resolve(`.env.${NODE_ENV}`) });

// DB connfigration (mongodb , redis)
export const PORT = parseInt(process.env.PORT ?? "9000");
export const DB_URI = process.env.DB_URI;
export const REDIS_URI = process.env.REDIS_URI;

// encyraption configration
export const ENC_KEY = process.env.ENC_KEY;
export const IV_LENGTH = parseInt(process.env.IV_LENGTH ?? "16");

// token configration
export const ACCESS_TOKEN_EXPIRES_IN = parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN ?? "900");
export const ACCESS_USER_TOKEN_SIGNATURE = process.env.ACCESS_USER_TOKEN_SIGNATURE;
export const ACCESS_SYSTEM_TOKEN_SIGNATURE = process.env.ACCESS_SYSTEM_TOKEN_SIGNATURE;
export const REFRESH_TOKEN_EXPIRES_IN = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN ?? "30758400");
export const REFRESH_USER_TOKEN_SIGNATURE = process.env.REFRESH_USER_TOKEN_SIGNATURE;
export const REFRESH_SYSTEM_TOKEN_SIGNATURE = process.env.REFRESH_SYSTEM_TOKEN_SIGNATURE;

// sigin with google configration client id
export const WEB_CLIENT_IDS = process.env.WEB_CLIENT_IDS ? process.env.WEB_CLIENT_IDS.split(",") : [];
// mail configration
export const APP_PASSWORD = process.env.APP_PASSWORD;
export const APP_EMAIL = process.env.APP_EMAIL;

// app name
export const APPLICATIION_NAME = process.env.APPLICATIION_NAME;
// allowed origins to access backend apis
export const ORIGINS = process.env.ORIGINS;
