"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getSecretKey_1 = __importDefault(require("../lib/getSecretKey"));
const optionalAuthenticate = async (req, res, next) => {
    const token = req.cookies.user_auth;
    if (!token) {
        req.user = undefined;
        return next();
    }
    try {
        const decoded = jsonwebtoken_1.default.decode(token);
        if (!decoded?.userId) {
            req.user = undefined;
            return next();
        }
        const secretKey = await (0, getSecretKey_1.default)(decoded.userId);
        const verified = jsonwebtoken_1.default.verify(token, secretKey);
        req.user = { id: verified.userId };
        next();
    }
    catch (error) {
        req.user = undefined;
        next();
    }
};
module.exports = optionalAuthenticate;
//# sourceMappingURL=ticketMiddleware.js.map