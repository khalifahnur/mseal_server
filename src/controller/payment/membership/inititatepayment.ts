import axios from "axios";
import { Response, Request } from "express";
import dotenv from "dotenv";

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.MSEAL_MEMBERSHIP_PAYSTACK_KEY || "";
//const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const User = require("../../../model/user");
const Membership = require("../../../model/membership");
const limits = require("./checkTier");

type MembershipTier = "ordinary" | "bronze" | "silver" | "gold";
type PaymentContext = "new" | "upgrade" | "renewal";

const tierPrices: Record<MembershipTier, number> = {
  ordinary: 500,
  bronze: 2000,
  silver: 5000,
  gold: 10000,
};

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
  body: {
    phoneNumber: string;
    amount?: number;
    email: string;
    membershipTier: MembershipTier;
    dob?: string;
    city: string;
    paymentContext?: PaymentContext;
  };
}

const initiatePayment = async (req: AuthenticatedRequest, res: Response) => {
  const {
    phoneNumber,
    amount,
    email,
    membershipTier,
    dob,
    city,
    paymentContext = "new",
  } = req.body;
  const userId = req.user?.id;

  if (!PAYSTACK_SECRET_KEY) {
    return res.status(500).json({ error: "Paystack secret key is missing" });
  }

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingMembership = user.membershipId
      ? await Membership.findById(user.membershipId)
      : null;

    if (paymentContext === "renewal") {
      if (!existingMembership) {
        return res.status(400).json({ error: "No existing membership to renew" });
      }

      if (existingMembership.membershipTier !== membershipTier) {
        return res.status(400).json({ 
          error: "Renewal must be for the same membership tier" 
        });
      }

      const today = new Date();
      if (existingMembership.expDate && existingMembership.expDate > today) {
        return res.status(400).json({ 
          error: "Membership is not yet expired" 
        });
      }
    }

    if (paymentContext === "upgrade" && existingMembership) {
      if (existingMembership.membershipTier === membershipTier) {
        return res.status(400).json({ 
          error: "User already has this membership tier" 
        });
      }
    }

    if (!tierPrices[membershipTier]) {
      return res.status(400).json({ error: `Invalid membership tier: ${membershipTier}` });
    }

    let finalAmount: number;
    let calculatedContext: PaymentContext = paymentContext;

    if (paymentContext === "renewal") {
      finalAmount = tierPrices[membershipTier];
      calculatedContext = "renewal";
    } else if (existingMembership && paymentContext === "upgrade") {
      finalAmount = tierPrices[membershipTier] - tierPrices[existingMembership.membershipTier as MembershipTier];
      if (finalAmount <= 0) {
        return res.status(400).json({
          error: `Cannot upgrade to ${membershipTier} as it is not higher than ${existingMembership.membershipTier}`,
        });
      }
      calculatedContext = "upgrade";
    } else {
      finalAmount = tierPrices[membershipTier];
      if (amount && amount !== finalAmount) {
        return res.status(400).json({
          error: `Provided amount (${amount}) does not match ${membershipTier} price (${finalAmount})`,
        });
      }
      calculatedContext = "new";
    }

    if (calculatedContext !== "renewal") {
      const count = await Membership.countDocuments({
        membershipTier,
        paymentStatus: "Completed",
      });

      if (count >= limits[membershipTier]) {
        return res.status(400).json({
          error: `${membershipTier} tier is full, please select another.`,
        });
      }
    }

    const response = await axios.post(
      "https://api.paystack.co/charge",
      {
        email,
        amount: finalAmount * 100,
        currency: "KES",
        mobile_money: {
          phone: phoneNumber,
          provider: "mpesa",
        },
        metadata: {
          userId,
          membershipTier,
          dob,
          city,
          paymentContext: calculatedContext,
          previousTier: existingMembership?.membershipTier,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let membership;
    if (existingMembership && (calculatedContext === "renewal" || calculatedContext === "upgrade")) {
      membership = existingMembership;
      membership.membershipTier = membershipTier;
      membership.amount = finalAmount;
      membership.dob = dob || membership.dob;
      membership.city = city || membership.city;
      membership.reference = response.data.data.reference;
      membership.paymentStatus = "Pending";
      membership.status = "Pending";
      await membership.save();
    } else {
      membership = new Membership({
        userId,
        membershipTier,
        dob: dob || null,
        city,
        amount: finalAmount,
        reference: response.data.data.reference,
        paymentStatus: "Pending",
        status: "Pending",
      });
      await membership.save();
    }

    res.json({
      message: "STK push initiated",
      status: true,
      reference: response.data.data.reference,
      paymentContext: calculatedContext,
      amount: finalAmount,
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