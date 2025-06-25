import crypto from "crypto";

function generateReference(userId: string){
  const shortUser = userId?.slice(-5).toLowerCase();
  const timestamp = Date.now();
  const random = crypto.randomBytes(3).toString("hex").toLowerCase();

  return `${shortUser}${timestamp}${random}`;
};

module.exports = generateReference;
