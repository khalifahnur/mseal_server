"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
function padNumber(num, size = 3) {
    return num.toString().padStart(size, '0');
}
function formatDate(date) {
    return date.toISOString().slice(0, 10).replace(/-/g, '');
}
function formatTime(date) {
    return date.toISOString().slice(11, 19).replace(/:/g, '');
}
function generateRandomString(length = 5) {
    return crypto_1.default.randomBytes(length).toString('base64url').slice(0, length);
}
function generateTicketId({ eventId, quantity, index, timestamp }) {
    const dateObj = new Date(timestamp ?? Date.now());
    const date = formatDate(dateObj);
    const time = formatTime(dateObj);
    //const rand = generateRandomString(5);
    const paddedIndex = padNumber(index);
    return `MS-${eventId}-${date}-${quantity}-${paddedIndex}`;
}
module.exports = generateTicketId;
//# sourceMappingURL=generateTicketId.js.map