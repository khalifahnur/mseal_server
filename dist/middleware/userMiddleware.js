"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getSecretKey_1 = __importDefault(require("../lib/getSecretKey"));
// Authentication middleware
const authenticateUser = async (req, res, next) => {
    const token = req.cookies.user_auth;
    if (!token) {
        return res.status(401).json({ message: "Access token is required" });
    }
    try {
        const decoded = jsonwebtoken_1.default.decode(token);
        if (!decoded?.userId) {
            return res.status(401).json({ message: "Invalid token" });
        }
        const secretKey = await (0, getSecretKey_1.default)(decoded?.userId);
        const verified = jsonwebtoken_1.default.verify(token, secretKey);
        req.user = { id: verified.userId };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({ message: "Token expired" });
        }
        res.status(401).json({ message: "Invalid token" });
        res.status(401).json({ message: "Invalid or expired token" });
    }
};
module.exports = authenticateUser;
//# sourceMappingURL=userMiddleware.js.map