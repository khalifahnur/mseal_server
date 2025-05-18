"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
dotenv_1.default.config();
const sk = process.env.TICKET_SECRET_KEY;
if (!sk) {
    throw new Error('TICKET_SECRET_KEY is not defined in environment variables');
}
const secretKey = crypto_1.default.createHash('sha256').update(sk).digest();
function encryptQr(data) {
    const iv = crypto_1.default.randomBytes(12);
    const cipher = crypto_1.default.createCipheriv('aes-256-gcm', secretKey, iv);
    const jsonData = JSON.stringify(data);
    const encrypted = Buffer.concat([
        cipher.update(jsonData, 'utf8'),
        cipher.final()
    ]);
    const authTag = cipher.getAuthTag();
    const payload = {
        iv: iv.toString('base64'),
        encryptedData: encrypted.toString('base64'),
        authTag: authTag.toString('base64')
    };
    return Buffer.from(JSON.stringify(payload)).toString('base64');
}
module.exports = encryptQr;
//# sourceMappingURL=encryptedQr.js.map