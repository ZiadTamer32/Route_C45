import CryptoJS from "crypto-js";
import { ENCRYPTION_KEY } from "../../../config/app.config.js";

export const encryption = (plainText) => {
  const ciphertext = CryptoJS.AES.encrypt(plainText, ENCRYPTION_KEY).toString();
  return ciphertext;
};
export const decryption = (plainText) => {
  const bytes = CryptoJS.AES.decrypt(plainText, ENCRYPTION_KEY);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
};
