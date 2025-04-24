// types/express.d.ts
import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string } & JwtPayload;
      adminId?: { id: string } & JwtPayload;
      memberId?: { id: string } & JwtPayload;
    }
  }
}
