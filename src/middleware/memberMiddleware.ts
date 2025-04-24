import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import getSecretKey from "../lib/getSecretKey";

const User = require("../model/user");

const attachRestaurantId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Access token is required" });
  }

  try {
    const secretKey = await getSecretKey();
    const decoded = jwt.verify(token, secretKey) as jwt.JwtPayload;
    const userId = decoded.userId;

    // Find the user by userId and get the membershipId
    const admin = await User.findById(userId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    req.memberId = admin.memberId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = attachRestaurantId;
