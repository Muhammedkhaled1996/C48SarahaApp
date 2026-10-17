import crypto from "crypto";
import { ENC_KEY, IV_LENGTH } from "./../../config.js";

const KEY = Buffer.from(ENC_KEY, "hex");

export const encryption = async (plainText) => {
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv("aes-256-cbc", KEY, iv);

  let encryptedData = cipher.update(plainText, "utf-8", "hex");
  encryptedData += cipher.final("hex");

  return `${iv.toString("hex")}::${encryptedData}`;
};

export const decryption = async (ciperText) => {
  const [iv, encryptedText] = ciperText.split("::"); // []

  const binaryLikeIv = Buffer.from(iv, "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", KEY, binaryLikeIv);

  let decryptedData = decipher.update(encryptedText, "hex", "utf8");
  decryptedData += decipher.final("utf-8");

  return decryptedData;
};
