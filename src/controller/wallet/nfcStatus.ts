import { Request, Response } from "express";

const User = require("../../model/user");
const Wallet = require("../../model/wallet");

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

const nfcStatus = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { status } = req.body;

  try {
    if (!userId) {
      return res.status(400).json({ error: "User not authenticated" });
    }

    const userInfo = await User.findById(userId);
    if (!userInfo) {
      return res.status(404).json({ error: "User info not found" });
    }

    const wallet = await Wallet.findOneAndUpdate({ userId }, { status });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    return res
      .status(200)
      .json({ message: `wallet status changed successful to ${status}` });
  } catch (error) {
    console.error("Error fetching user info:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = nfcStatus;