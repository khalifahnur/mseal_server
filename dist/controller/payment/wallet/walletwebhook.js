"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const Wallet = require("../../../model/wallet");
const Transaction = require("../../../model/transaction");
const PAYSTACK_SECRET = process.env.MSEAL_WALLET_PAYSTACK_KEY || "";
const handleWalletPaystackWebhook = async (req, res) => {
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
        const { reference, amount, metadata } = event.data;
        const existingTicket = await Wallet.findOne({
            prepaidReference: reference,
        });
        if (existingTicket?.paymentStatus === "Completed") {
            return res.status(200).json({ message: "Transaction already processed" });
        }
        const session = await mongoose_1.default.startSession();
        try {
            await session.withTransaction(async () => {
                const verifyResponse = await axios_1.default.get(`https://api.paystack.co/transaction/verify/${reference}`, {
                    headers: {
                        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
                    },
                });
                if (verifyResponse.data.data.status !== "success") {
                    throw new Error("Transaction verification failed");
                }
                const wallet = await Wallet.findOne({ userId: metadata.userId }, null, {
                    session,
                });
                if (!wallet) {
                    throw new Error("Wallet not found");
                }
                wallet.paymentStatus = "Completed";
                wallet.balance += amount / 100;
                await wallet.save({ session });
                const transaction = new Transaction({
                    userId: metadata.userId,
                    transactionType: "prepaid",
                    amount: amount / 100,
                    status: "Success",
                    paymentMethod: "Mpesa",
                    reference,
                });
                await transaction.save({ session });
            });
            res.status(200).send("Webhook processed successfully");
        }
        catch (err) {
            console.error("Webhook error:", err);
            res.status(500).json({ error: "Failed to process webhook" });
        }
    }
    else {
        res.status(200).send("Event ignored");
    }
};
module.exports = handleWalletPaystackWebhook;
//# sourceMappingURL=walletwebhook.js.map