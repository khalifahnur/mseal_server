import axios from "axios";
import { Request, Response } from "express";
import winston from "winston";

const Membership = require("../../../../model/membership");
const User = require("../../../../model/user");
const getPesapalToken = require("./pesapaltoken");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

const membershipPaymentCallback = async (req: Request, res: Response) => {
  const { OrderTrackingId, OrderMerchantReference } = req.query;

  try {
    const membership = await Membership.findOne({
      pesapalTransactionId: OrderTrackingId,
    });
    if (!membership) {
      logger.warn(`Membership not found for tracking ID: ${OrderTrackingId}`);
      return res.status(404).json({ error: "Membership not found" });
    }

    const token = await getPesapalToken();
    const statusResponse = await axios.get(
      `https://cybqa.pesapal.com/pesapalv3/api/Transactions/GetTransactionStatus?OrderTrackingId=${OrderTrackingId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (statusResponse.data.payment_status_description === "Completed") {
      // Ensure OrderMerchantReference is a string
      const reference =
        typeof OrderMerchantReference === "string"
          ? OrderMerchantReference
          : "";
      if (!reference) {
        logger.warn(
          `Invalid OrderMerchantReference for transaction: ${OrderTrackingId}`
        );
        return res.status(400).json({ error: "Invalid merchant reference" });
      }

      // Extract tier from reference
      const match = reference.match(/(bronze|silver|gold)/i);
      if (!match) {
        logger.warn(`No valid tier found in reference: ${reference}`);
        return res.status(400).json({ error: "Invalid tier in reference" });
      }
      const tier = match[0].toLowerCase();

      const metadata = statusResponse.data.metadata || {};
      const userId = metadata.userId;
      const isUpgrade = metadata.isUpgrade === "true";

      if (!userId) {
        logger.warn(
          `No userId in metadata for transaction: ${OrderTrackingId}`
        );
        return res.status(400).json({ error: "Invalid transaction data" });
      }

      const user = await User.findById(userId);
      if (!user) {
        logger.warn(`User not found: ${userId}`);
        return res.status(404).json({ error: "User not found" });
      }

      membership.membershipTier = tier;
      membership.paymentStatus = "completed";
      membership.status = "valid";
      const expDate = new Date();
      expDate.setMonth(expDate.getMonth() + 1);
      membership.expDate = expDate;
      await membership.save();

      if (!isUpgrade) {
        // Only update User.membershipId for new memberships
        await User.findByIdAndUpdate(userId, { membershipId: membership._id });
      }

      logger.info(
        `Payment ${OrderMerchantReference} completed for user ${userId}, tier: ${tier}, isUpgrade: ${isUpgrade}`
      );
      return res.status(200).json({ message: "Payment processed" });
    } else {
      membership.paymentStatus = "failed";
      membership.status = "denied";
      await membership.save();
      logger.error(`Payment ${OrderMerchantReference} failed`);
      return res.status(400).json({ error: "Payment failed" });
    }
  } catch (error) {
    logger.error("Callback processing error:", (error as Error).message);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = membershipPaymentCallback;
