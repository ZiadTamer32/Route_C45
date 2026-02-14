import crypto from "node:crypto";

const algorithm = "aes-256-cbc";
const secretKey = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

export function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    iv: iv.toString("hex"),
    content: encrypted,
  };
}
