import { Request, Response } from "express";
const transferToMpesa = require("./transferpayment");
const Membership = require("../../../model/membership");
const User = require("../../../model/user");
import * as crypto from "crypto";

const handleWebhook = async (req: Request, res: Response) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY || "";
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      console.error("Invalid Paystack signature");
      return res.sendStatus(400);
    }

    console.log("Webhook received:", JSON.stringify(req.body, null, 2));
    const event = req.body;

    if (!event || !event.event || event.event !== "charge.success") {
      console.log("Invalid or non-success event received");
      return res.sendStatus(200); // Acknowledge but skip processing
    }

    const reference = event.data.reference;

    // Check for duplicates
    const existingMembership = await Membership.findOne({ reference });
    if (existingMembership) {
      console.log("Duplicate webhook ignored:", reference);
      return res.sendStatus(200);
    }

    // Acknowledge
    res.sendStatus(200);

    processWebhookEvent(event).catch((error) => {
      console.error("Error processing webhook event:", error.message);
    });
  } catch (error: any) {
    console.error("Webhook error during initial handling:", error.message);
    res.sendStatus(200);
  }
};

const processWebhookEvent = async (event: any) => {
  const metadata = event.data.metadata;
  const userId = metadata?.userId;
  const amount = event.data.amount / 100;
  const reference = event.data.reference;

  if (!userId) {
    console.error("Missing userId in metadata:", metadata);
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    console.error("User not found for ID:", userId);
    return;
  }

  // Membership data
  const membershipData = {
    membershipTier: metadata.membershipTier,
    dob: metadata.dob || null,
    physicalAddress: metadata.physicalAddress,
    city: metadata.city,
    amount,
    reference,
  };

  const newMember = new Membership(membershipData);
  const savedData = await newMember.save();
  console.log("Membership saved:", savedData);

  await User.findByIdAndUpdate(userId, {
    membershipId: savedData._id,
  });
  console.log("User updated with membership ID:", savedData._id);

    // Transfer to reciever number
  await transferToMpesa(amount);
  console.log("Transfer to business Till completed successfully");
};

module.exports = handleWebhook;
