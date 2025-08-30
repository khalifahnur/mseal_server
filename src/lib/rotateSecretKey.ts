import Redis from "ioredis";
import generateSecretKey from "./generateSecretKey";

// const redis = new Redis();
const redis = new Redis(process.env.REDIS_URL! );


const newSecretKey = async (userId: string) => {
  const SECRET_KEY_REDIS_KEY = `user:${userId}:jwt_secret`;

  let secretKey = generateSecretKey();
  await redis.set(SECRET_KEY_REDIS_KEY, secretKey);

  return secretKey;
};

export default newSecretKey;
