import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import getSecretKey from "../../../lib/getSecretKey";
import Redis from "ioredis";

interface AuthenticatedRequest extends Request {
  admin?: {
    id: string;
  };
}

const redisClient = new Redis();

const LogoutAdmin = async (req: AuthenticatedRequest, res: Response) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const secretKey = await getSecretKey();

    const decoded = jwt.verify(token, secretKey) as jwt.JwtPayload;
    await redisClient.del(`token:${decoded.id}`);

    // Clear the cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // set to true in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/", // ensure the path matches where the cookie was set
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    // Optional: only really needed if you’re relying on the verification step
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }

    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = LogoutAdmin;
