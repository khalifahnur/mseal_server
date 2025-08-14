"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
function generateReference(userId) {
    const shortUser = userId?.slice(-5).toLowerCase();
    const timestamp = Date.now();
    const random = crypto_1.default.randomBytes(3).toString("hex").toLowerCase();
    return `${shortUser}${timestamp}${random}`;
}
;
module.exports = generateReference;
//# sourceMappingURL=generateReference.js.map