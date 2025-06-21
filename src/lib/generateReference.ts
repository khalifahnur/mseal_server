import crypto from "crypto";

export const generateReference = (userId: string) => {
  const shortUser = userId.slice(-5).toUpperCase();
  const timestamp = Date.now();
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();

  return `${shortUser}-${timestamp}-${random}`;
};
