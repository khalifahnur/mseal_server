import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const sk = process.env.WALLET_SECRET_KEY;

if (!sk) {
  throw new Error("WALLET_SECRET_KEY is not defined in environment variables");
}

const secretKey = crypto.createHash("sha256").update(sk).digest();

function decryptWallet(encryptedData: string) {
  try {
    const data = Buffer.from(encryptedData, "base64");
    const iv = data.slice(0, 12);
    const authTag = data.slice(data.length - 16);
    const encrypted = data.slice(12, data.length - 16);

    const decipher = crypto.createDecipheriv("aes-256-gcm", secretKey, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch (error: any) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

module.exports = decryptWallet;
