import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const sk = process.env.WALLET_SECRET_KEY;

if (!sk) {
  throw new Error("WALLET_SECRET_KEY is not defined in environment variables");
}

const secretKey = crypto.createHash("sha256").update(sk).digest();

function encryptWallet(data: any) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", secretKey, iv);
  const input = typeof data === "string" ? data : JSON.stringify(data);

  const encrypted = Buffer.concat([
    cipher.update(input, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, encrypted, authTag]).toString("base64");
}

module.exports = encryptWallet;
