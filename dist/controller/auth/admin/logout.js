"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const rotateSecretKey_1 = __importDefault(require("../../../lib/rotateSecretKey"));
const getSecretKey_1 = __importDefault(require("../../../lib/getSecretKey"));
const LogoutAdmin = async (req, res) => {
    const token = req.cookies?.admin_auth;
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }
    try {
        const decoded = jsonwebtoken_1.default.decode(token);
        if (!decoded?.adminId) {
            return res.status(401).json({ message: "Invalid token structure" });
        }
        const secretKey = await (0, getSecretKey_1.default)(decoded.adminId);
        jsonwebtoken_1.default.verify(token, secretKey);
        await (0, rotateSecretKey_1.default)(decoded.adminId);
        res.clearCookie("admin_auth", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
        });
        return res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            res.clearCookie("admin_auth", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                path: "/",
            });
            return res.status(401).json({ message: "Token has expired" });
        }
        return res.status(401).json({ message: "Invalid token" });
    }
};
module.exports = LogoutAdmin;
//# sourceMappingURL=logout.js.map