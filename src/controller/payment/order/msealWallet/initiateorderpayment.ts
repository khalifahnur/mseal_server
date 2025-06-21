import { Request, Response } from "express";
import mongoose from "mongoose";

const Order = require("../../../model/order");
const Merchandise = require("../../../model/merchandise");
const publishToQueue = require("../../../lib/queue/order_email/producer");
const Wallet = require("../../../../model/wallet");
const Transaction = require("../../../../model/transaction");
const generateReference = require("../../../../lib/generateReference");
const generateOrderId = require("../../../../lib/generateOrderId");
const User = require("../../../../model/user");

/**
 * @param
 * checks for balance and compares with totalAmount
 * deduct balance else return res.status insufficient amount
 * generate unique reference for that payment
 * update order stock
 * transaction model
 * send email
 *
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

const handleMsealWalletOrder = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { items, totalAmount, shippingAddress, phoneNumber } = req.body;
  const userId = req.user?.id;

  if (!userId || !items || !totalAmount || !shippingAddress || !phoneNumber) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const [user, wallet] = await Promise.all([
        User.findById(userId).session(session),
        Wallet.findOne({ userId, status: "Active" }).session(session),
      ]);

      if (!user) {
        throw new Error("User not found");
      }
      if (!wallet) {
        throw new Error("Active wallet not found");
      }
      if (wallet.balance < totalAmount) {
        throw new Error("Insufficient funds");
      }

      const reference = generateReference(userId);
      const existingOrder = await Order.findOne({
        transactionReference: reference,
      }).session(session);
      if (existingOrder?.paymentStatus === "Completed") {
        throw new Error("Transaction already processed");
      }

      let order = existingOrder;
      if (!order) {
        order = new Order({
          userInfo: userId,
          items,
          totalAmount,
          shippingAddress,
          phoneNumber,
          transactionReference: reference,
          status: "Pending",
          paymentStatus: "Pending",
          orderId: generateOrderId(),
        });
      }

      for (const item of items) {
        const product = await Merchandise.findById(item.productId).session(
          session
        );
        if (!product || product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.productId}`);
        }
        product.stock -= item.quantity;
        await product.save({ session });
      }

      // Deduct balance from wallet
      wallet.balance -= totalAmount;
      wallet.paymentStatus = "Completed";
      await wallet.save({ session });

      // Create transaction record
      const transaction = new Transaction({
        userId,
        transactionType: "merchandise",
        amount: totalAmount,
        status: "Success",
        paymentMethod: "Mseal-wallet",
        reference,
      });
      await transaction.save({ session });

      order.status = "Processing";
      order.paymentStatus = "Completed";
      order.updatedAt = new Date();
      await order.save({ session });

      await publishToQueue("email_order_confirmation", {
        orderId: order._id,
        email: user.email,
        metadata: {
          userId,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });

      return res.status(200).json({
        message: "Order processed successfully",
        orderId: order.orderId,
        reference,
      });
    });
  } catch (error: any) {
    console.error("Order processing error:", error.message);
    return res.status(400).json({ error: error.message });
  } finally {
    await session.endSession();
  }
};

module.exports = handleMsealWalletOrder;
