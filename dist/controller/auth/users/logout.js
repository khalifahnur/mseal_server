"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getSecretKey_1 = __importDefault(require("../../../lib/getSecretKey"));
const ioredis_1 = __importDefault(require("ioredis"));
const redisClient = new ioredis_1.default();
const LogoutUser = async (req, res) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }
    try {
        const secretKey = await (0, getSecretKey_1.default)();
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        await redisClient.del(`token:${decoded.id}`);
        // Clear the cookie
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
        });
        return res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token has expired" });
        }
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
module.exports = LogoutUser;
//# sourceMappingURL=logout.js.map