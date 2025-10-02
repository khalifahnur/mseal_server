import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import getSecretKey from "../lib/getSecretKey";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

const optionalAuthenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.user_auth;

  if (!token) {
    req.user = undefined;
    return next();
  }

  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    if (!decoded?.userId) {
      req.user = undefined;
      return next();
    }

    const secretKey = await getSecretKey(decoded.userId);
    const verified = jwt.verify(token, secretKey) as jwt.JwtPayload;
    
    req.user = { id: verified.userId };
    next();
  } catch (error) {
    req.user = undefined;
    next();
  }
};

module.exports = optionalAuthenticate;