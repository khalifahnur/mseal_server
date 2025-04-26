"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getSecretKey_1 = __importDefault(require("../lib/getSecretKey"));
const User = require("../model/user");
const attachRestaurantId = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Access token is required" });
    }
    try {
        const secretKey = await (0, getSecretKey_1.default)();
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        const userId = decoded.userId;
        // Find the user by userId and get the membershipId
        const admin = await User.findById(userId);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        req.memberId = admin.memberId;
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};
module.exports = attachRestaurantId;
//# sourceMappingURL=memberMiddleware.js.map