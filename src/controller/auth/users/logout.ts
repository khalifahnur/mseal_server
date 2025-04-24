import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import getSecretKey from "../../../lib/getSecretKey";
import Redis from "ioredis";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

const redisClient = new Redis();

const LogoutUser = async (req: AuthenticatedRequest, res: Response) => {
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
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }

    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = LogoutUser;
