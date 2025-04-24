import Redis from "ioredis";
import generateSecretKey from "./generateSecretKey";

const redis = new Redis();
const SECRET_KEY_REDIS_KEY = "jwt_secret_key";

// Function to get the secret key from Redis (or generate if missing)
const getSecretKey = async () => {
  let secretKey = await redis.get(SECRET_KEY_REDIS_KEY);

  if (!secretKey) {
    secretKey = generateSecretKey();
    await redis.set(SECRET_KEY_REDIS_KEY, secretKey);
  }

  return secretKey;
};

export default getSecretKey;
