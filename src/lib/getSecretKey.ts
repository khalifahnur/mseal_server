import Redis from "ioredis";
import generateSecretKey from "./generateSecretKey";
import dotenv from 'dotenv';

dotenv.config();

//const redis = new Redis();
const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379' );


const getSecretKey = async (userId:string) => {
  const SECRET_KEY_REDIS_KEY = `user:${userId}:jwt_secret`;
  let secretKey = await redis.get(SECRET_KEY_REDIS_KEY);

  if (!secretKey) {
    secretKey = generateSecretKey();
    await redis.set(SECRET_KEY_REDIS_KEY, secretKey);
  }

  return secretKey;
};

export default getSecretKey;
