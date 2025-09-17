"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const generateSecretKey_1 = __importDefault(require("./generateSecretKey"));
const redis = new ioredis_1.default('redis://localhost:6379');
//const redis = new Redis(process.env.REDIS_URL! + "?family=0" );
const newSecretKey = async (userId) => {
    const SECRET_KEY_REDIS_KEY = `user:${userId}:jwt_secret`;
    let secretKey = (0, generateSecretKey_1.default)();
    await redis.set(SECRET_KEY_REDIS_KEY, secretKey);
    return secretKey;
};
exports.default = newSecretKey;
//# sourceMappingURL=rotateSecretKey.js.map