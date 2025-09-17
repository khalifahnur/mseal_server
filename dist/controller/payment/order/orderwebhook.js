"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const Order = require("../../../model/order");
const Merchandise = require("../../../model/merchandise");
const Transaction = require("../../../model/transaction");
const publishToQueue = require("../../../lib/queue/order_email/producer");
dotenv_1.default.config();
const PAYSTACK_SECRET = process.env.MSEAL_MERCH_PAYSTACK_KEY || "";
const handlePaystackWebhook = async (req, res) => {
    const hash = crypto_1.default
        .createHmac("sha512", PAYSTACK_SECRET)
        .update(JSON.stringify(req.body))
        .digest("hex");
    const paystackSignature = req.headers["x-paystack-signature"];
    if (hash !== paystackSignature) {
        return res.status(401).json({ error: "Invalid signature" });
    }
    const event = req.body;
    if (event.event === "charge.success" &&
        event.data.channel === "mobile_money") {
        const { reference, amount, status, customer, metadata } = event.data;
        const existingOrder = await Order.findOne({
            transactionReference: reference,
        });
        if (existingOrder?.paymentStatus === "Completed") {
            return res.status(200).json({ message: "Transaction already processed" });
        }
        const session = await mongoose_1.default.startSession();
        try {
            await session.withTransaction(async () => {
                const verifyResponse = await axios_1.default.get(`https://api.paystack.co/transaction/verify/${reference}`, {
                    headers: {
                        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    },
                });
                if (verifyResponse.data.data.status !== "success") {
                    throw new Error("Transaction verification failed");
                }
                const order = await Order.findOne({ transactionReference: reference }, null, { session });
                if (!order) {
                    throw new Error("Order not found");
                }
                // if (order.totalAmount * 100 !== amount) {
                //   throw new Error("Amount mismatch");
                // }
                for (const item of order.items) {
                    const product = await Merchandise.findById(item.productId, null, {
                        session,
                    });
                    if (!product || product.stock < item.quantity) {
                        throw new Error(`Insufficient stock for product ${item.productId}`);
                    }
                    product.stock -= item.quantity;
                    await product.save({ session });
                }
                const transaction = new Transaction({
                    userId: metadata.userId,
                    transactionType: "merchandise",
                    amount: amount / 100,
                    status: "Success",
                    paymentMethod: "Mpesa",
                    reference,
                });
                await transaction.save({ session });
                order.status = "Processing";
                order.paymentStatus = "Completed";
                order.updatedAt = new Date();
                await order.save({ session });
                console.log("metadata", metadata);
                await publishToQueue("email_order_confirmation", {
                    orderId: order._id,
                    email: customer.email,
                    metadata,
                });
            });
            res.status(200).json({ message: "Webhook processed" });
        }
        catch (error) {
            console.error("Webhook error:", error.message);
            await session.endSession();
            res.status(400).json({ message: error.message });
        }
        finally {
            await session.endSession();
        }
    }
    else {
        res.status(200).json({ message: "Event ignored" });
    }
};
module.exports = handlePaystackWebhook;
//# sourceMappingURL=orderwebhook.js.map