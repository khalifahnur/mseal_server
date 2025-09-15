import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

const User = require("../../../model/user");
const Wallet = require("../../../model/wallet");

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.MSEAL_WALLET_PAYSTACK_KEY || "";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

const initiatewalletpayment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { amount, phoneNumber } = req.body;
  const userId = req.user?.id;

  if (!PAYSTACK_SECRET_KEY) {
    return res.status(500).json({ error: "Paystack secret key is missing" });
  }

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const userObj = await User.findById(userId);
    const wallet = await Wallet.findOne({ userId });

    if (!userObj) {
      return res.status(404).json({ error: "User not found" });
    }

    const { email, firstName, lastName } = userObj;

    if (!email) {
      return res.status(400).json({ error: "User email is required" });
    }
    if (!phoneNumber) {
      return res.status(400).json({ error: "User phone number is required" });
    }
    if (!wallet) {
      return res.status(400).json({ error: "wallet not found" });
    }

    if (amount < 0 && wallet.balance + amount < 0) {
      throw new Error("Insufficient funds");
    }

    const response = await axios.post(
      "https://api.paystack.co/charge",
      {
        email,
        amount: amount * 100,
        currency: "KES",
        mobile_money: {
          phone: phoneNumber,
          provider: "mpesa",
        },
        metadata: {
          userId,
          firstName,
          lastName,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    wallet.paymentStatus = "Pending";
    wallet.prepaidReference = response.data.data.reference;
    await wallet.save();

    res.json({
      message: "STK push initiated",
      status: true,
      reference: response.data.data.reference,
    });
  } catch (error: any) {
    console.error(
      "Error initiating payment:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to initiate payment",
      details: error.response?.data || error.message,
    });
  }
};

module.exports = initiatewalletpayment;
