"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
dotenv_1.default.config();
const sk = process.env.WALLET_SECRET_KEY;
if (!sk) {
    throw new Error("WALLET_SECRET_KEY is not defined in environment variables");
}
const secretKey = crypto_1.default.createHash("sha256").update(sk).digest();
function decryptWallet(encryptedData) {
    try {
        const data = Buffer.from(encryptedData, "base64");
        const iv = data.slice(0, 12);
        const authTag = data.slice(data.length - 16);
        const encrypted = data.slice(12, data.length - 16);
        const decipher = crypto_1.default.createDecipheriv("aes-256-gcm", secretKey, iv);
        decipher.setAuthTag(authTag);
        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final(),
        ]);
        return decrypted.toString("utf8");
    }
    catch (error) {
        throw new Error(`Decryption failed: ${error.message}`);
    }
}
module.exports = decryptWallet;
//# sourceMappingURL=decryptWallet.js.map