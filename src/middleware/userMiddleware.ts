import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import getSecretKey from "../lib/getSecretKey";

// Authentication middleware
const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Access token is required" });
  }

  try {
    const secretKey = await getSecretKey();
    const decoded = jwt.verify(token, secretKey) as jwt.JwtPayload;
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authenticateUser;
