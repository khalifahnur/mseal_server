import axios from "axios";
import { Response, Request } from "express";
import dotenv from "dotenv";

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.MSEAL_MEMBERSHIP_PAYSTACK_KEY || "";
//const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";

const Membership = require("../../../model/membership");
const limits = require("./checkTier");

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

const initiatePayment = async (req: AuthenticatedRequest, res: Response) => {
  const {
    phoneNumber,
    amount,
    email,
    membershipTier,
    dob,
    physicalAddress,
    city,
  } = req.body;
  const userId = req.user?.id;

  if (!PAYSTACK_SECRET_KEY) {
    return res.status(500).json({ error: "Paystack secret key is missing" });
  }

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const count = await Membership.countDocuments({
    membershipTier,
    paymentStatus: "Completed",
  });
  
  if (count >= limits[membershipTier]) {
    return res
      .status(400)
      .json({
        error: `${membershipTier} tier is full, please select another.`,
      });
  }

  try {
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
          membershipTier,
          dob,
          physicalAddress,
          city,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const membership = new Membership({
      userId,
      membershipTier,
      dob: dob || null,
      physicalAddress,
      city,
      amount,
      reference: response.data.data.reference,
      paymentStatus: "Pending",
      status: "Pending",
    });
    await membership.save();

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

module.exports = initiatePayment;
