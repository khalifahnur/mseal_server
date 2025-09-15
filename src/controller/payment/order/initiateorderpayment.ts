import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

const User = require("../../../model/user");
const Order = require("../../../model/order");
const Merchandise = require("../../../model/merchandise");
const generateOrderId = require("../../../lib/generateOrderId");

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.MSEAL_MERCH_PAYSTACK_KEY || "";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

const initiateorderpayment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { items, totalAmount, shippingAddress,phoneNumber } = req.body;
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

    const { email,firstName,lastName } = userObj;

    if (!email) {
      return res.status(400).json({ error: "User email is required" });
    }
    if (!phoneNumber) {
      return res.status(400).json({ error: "User phone number is required" });
    }

    for (const item of items) {
  const product = await Merchandise.findById(item.productId);
  if (!product) {
    return res.status(400).json({ error: `Product ${item.productId} not found` });
  }
  if (product.stock < item.quantity) {
    return res.status(400).json({ error: `Insufficient stock for product ${item.productId}` });
  }
}

    const response = await axios.post(
      "https://api.paystack.co/charge",
      {
        email,
        amount: totalAmount * 100,
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
        timeout: 10000,
      }
    );

    const order = new Order({
      userInfo:userId,
      items,
      totalAmount,
      shippingAddress,
      transactionReference: response.data.data.reference,
      status: "Pending",
      paymentStatus: "Pending",
      orderId: generateOrderId(),
    }
  );
    await order.save();

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

module.exports = initiateorderpayment;
