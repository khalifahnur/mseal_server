import axios from "axios";
import { Response, Request } from "express";
import dotenv from "dotenv";

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";

const User = require("../../../model/user");

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

const initiateTicketPayment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { eventId, match, date, venue, quantity, amount } = req.body;
  const userId = req.user?.id;

  if (!PAYSTACK_SECRET_KEY) {
    return res.status(500).json({ error: "Paystack secret key is missing" });
  }

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const userObj = await User.findById(userId);

    if (!userObj) {
      return res.status(404).json({ error: "User not found" });
    }

    const { email, phoneNumber } = userObj;

    if (!email) {
      return res.status(400).json({ error: "User email is required" });
    }
    if (!phoneNumber) {
      return res.status(400).json({ error: "User phone number is required" });
    }

    console.log(phoneNumber);

    const response = await axios.post(
      "https://api.paystack.co/charge",
      {
        email,
        amount: amount * 100, // Convert to kobo
        currency: "KES",
        mobile_money: {
          phone: phoneNumber,
          provider: "mpesa",
        },
        metadata: {
          userId,
          eventId,
          match,
          date,
          venue,
          quantity,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

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

module.exports = initiateTicketPayment;