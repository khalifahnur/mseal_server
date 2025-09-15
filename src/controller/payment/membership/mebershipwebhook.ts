import { Request, Response } from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import axios from "axios";
import dotenv from "dotenv";

const Membership = require("../../../model/membership");
const User = require("../../../model/user");
const Transaction = require("../../../model/transaction");
const Wallet = require("../../../model/wallet");
const publishToQueue = require("../../../lib/queue/membership/producer");

dotenv.config();

const PAYSTACK_SECRET = process.env.MSEAL_MEMBERSHIP_PAYSTACK_KEY || "";
// const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";

interface PaystackEvent {
  event: string;
  data: {
    reference: string;
    amount: number;
    status: string;
    channel: string;
    customer: {
      email: string;
    };
    metadata: {
      userId: string;
      membershipTier: string;
      dob?: string;
      physicalAddress?: string;
      city?: string;
    };
  };
}

const handlePaystackMembershipWebhook = async (req: Request, res: Response) => {
  // Verify Paystack signature
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");
  const paystackSignature = req.headers["x-paystack-signature"];
  if (hash !== paystackSignature) {
    console.error("Invalid Paystack signature");
    return res.status(401).json({ error: "Invalid signature" });
  }

  const event: PaystackEvent = req.body;

  if (
    event.event === "charge.success" &&
    event.data.channel === "mobile_money"
  ) {
    const { reference, amount, metadata } = event.data;

    const existingMembership = await Membership.findOne({ reference });
    if (existingMembership?.paymentStatus === "Completed") {
      console.log("Duplicate webhook ignored:", reference);
      return res.status(200).json({ message: "Transaction already processed" });
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const verifyResponse = await axios.get(
          `https://api.paystack.co/transaction/verify/${reference}`,
          {
            headers: {
              Authorization: `Bearer ${PAYSTACK_SECRET}`,
            },
          }
        );
        if (verifyResponse.data.data.status !== "success") {
          throw new Error("Transaction verification failed");
        }

        // Fetch user
        const user = await User.findById(metadata.userId).session(session);

        if (!user) {
          throw new Error("User not found");
        }

        let membership = existingMembership;

        const expDate = new Date();
        expDate.setFullYear(expDate.getFullYear() + 1);
        membership.expDate = expDate;

        membership.status = "Active";
        membership.paymentStatus = "Completed";
        membership.updatedAt = new Date();
        await membership.save({ session });

        // wallet
        let wallet = await Wallet.findOne({ userId: metadata.userId }).session(
          session
        );
        if (!wallet) {
          wallet = new Wallet({
            userId: metadata.userId,
            balance: 0,
            status: "Active",
            paymentStatus: "Completed",
            prepaidReference: reference || undefined,
          });
          await wallet.save({ session });
          await User.findByIdAndUpdate(
            metadata.userId,
            { walletId: wallet._id },
            { session }
          );
        }

        const transaction = new Transaction({
          userId: metadata.userId,
          transactionType: "membership",
          amount:amount/100,
          status: "Success",
          paymentMethod: "Mpesa",
          reference,
          createdAt: new Date(),
        });
        await transaction.save({ session });

        await User.findByIdAndUpdate(
          metadata.userId,
          { membershipId: membership._id },
          { session }
        );

        // Publish email confirmation to queue
        await publishToQueue("email_membership_confirmation", {
          firstName: user.firstName,
          email: user.email,
          membershipTier: metadata.membershipTier,
          purchaseDate: new Date(),
          transcationId: reference,
          billingPeriod: expDate,
          paymentMethod: "Mpesa",
          amount,
          nextBillingDate: expDate,
          recurringAmount: amount,
        });
      });

      res.status(200).json({ message: "Webhook processed successfully" });
    } catch (error: any) {
      console.error("Webhook processing error:", error.message);
      res.status(400).json({ error: error.message });
    } finally {
      await session.endSession();
    }
  } else {
    console.log("Non-relevant event ignored:", event.event);
    res.status(200).json({ message: "Event ignored" });
  }
};

module.exports = handlePaystackMembershipWebhook;
