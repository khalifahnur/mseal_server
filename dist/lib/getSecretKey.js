"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const generateSecretKey_1 = __importDefault(require("./generateSecretKey"));
const redis = new ioredis_1.default();
const SECRET_KEY_REDIS_KEY = "jwt_secret_key";
const getSecretKey = async () => {
    let secretKey = await redis.get(SECRET_KEY_REDIS_KEY);
    if (!secretKey) {
        secretKey = (0, generateSecretKey_1.default)();
        await redis.set(SECRET_KEY_REDIS_KEY, secretKey);
    }
    return secretKey;
};
exports.default = getSecretKey;
//# sourceMappingURL=getSecretKey.js.map