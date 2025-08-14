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
function encryptWallet(data) {
    const iv = crypto_1.default.randomBytes(12);
    const cipher = crypto_1.default.createCipheriv("aes-256-gcm", secretKey, iv);
    const input = typeof data === "string" ? data : JSON.stringify(data);
    const encrypted = Buffer.concat([
        cipher.update(input, "utf8"),
        cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, encrypted, authTag]).toString("base64");
}
module.exports = encryptWallet;
//# sourceMappingURL=encryptWallet.js.map