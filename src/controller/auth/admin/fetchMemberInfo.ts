import { Request, Response } from "express";

const User = require("../../../model/user");

interface AuthenticatedRequest extends Request {
  adminId?: {
    id: string;
  };
}

const encryptQr = require("../../../lib/encryptedQr");

const getMemberInfo = async (req: AuthenticatedRequest, res: Response) => {
  const adminId = req.adminId?.id;
  try {
    if (!adminId) {
      return res.status(400).json({ error: "admin not authenticated" });
    }

    const users = await User.find()
      .populate(
        "membershipId",
        "membershipTier amount status createdAt expDate"
      )
      .lean();

    if (!users || users.length === 0) {
      return res.status(404).json({ error: "No users found" });
    }

    const responseData = users.map((user:any) => ({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      membershipTier: user.membershipId?.membershipTier || null,
      membershipId: user.membershipId?._id || null,
      balance: user.membershipId?.amount || 0,
      createdAt: user.membershipId?.createdAt || null,
      expDate: user.membershipId?.expDate || null,
      qrcode: user.membershipId
        ? encryptQr(user.membershipId._id.toString())
        : null,
      physicalIdIssued: user.physicalIdIssued,
      lockRequested: user.lockRequested,
    }));

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching user info:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = getMemberInfo;
