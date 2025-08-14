"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = __importDefault(require("mongoose"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const Membership = require("../../../model/membership");
const User = require("../../../model/user");
const Transaction = require("../../../model/transaction");
const Wallet = require("../../../model/wallet");
const publishToQueue = require("../../../lib/queue/membership/producer");
dotenv_1.default.config();
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";
const handlePaystackMembershipWebhook = async (req, res) => {
    // Verify Paystack signature
    const hash = crypto_1.default
        .createHmac("sha512", PAYSTACK_SECRET)
        .update(JSON.stringify(req.body))
        .digest("hex");
    const paystackSignature = req.headers["x-paystack-signature"];
    if (hash !== paystackSignature) {
        console.error("Invalid Paystack signature");
        return res.status(401).json({ error: "Invalid signature" });
    }
    const event = req.body;
    if (event.event === "charge.success" &&
        event.data.channel === "mobile_money") {
        const { reference, amount, metadata } = event.data;
        const existingMembership = await Membership.findOne({ reference });
        if (existingMembership?.paymentStatus === "Completed") {
            console.log("Duplicate webhook ignored:", reference);
            return res.status(200).json({ message: "Transaction already processed" });
        }
        const session = await mongoose_1.default.startSession();
        try {
            await session.withTransaction(async () => {
                const verifyResponse = await axios_1.default.get(`https://api.paystack.co/transaction/verify/${reference}`, {
                    headers: {
                        Authorization: `Bearer ${PAYSTACK_SECRET}`,
                    },
                });
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
                expDate.setMonth(expDate.getMonth() + 1);
                membership.expDate = expDate;
                membership.status = "Active";
                membership.paymentStatus = "Completed";
                membership.updatedAt = new Date();
                await membership.save({ session });
                // wallet
                let wallet = await Wallet.findOne({ userId: metadata.userId }).session(session);
                if (!wallet) {
                    wallet = new Wallet({
                        userId: metadata.userId,
                        balance: 0,
                        status: "Active",
                        paymentStatus: "Completed",
                    });
                    await wallet.save({ session });
                    await User.findByIdAndUpdate(metadata.userId, { walletId: wallet._id }, { session });
                }
                // transaction
                const transaction = new Transaction({
                    userId: metadata.userId,
                    transactionType: "membership",
                    amount: amount / 100,
                    status: "Success",
                    paymentMethod: "Mpesa",
                    reference,
                    createdAt: new Date(),
                });
                await transaction.save({ session });
                await User.findByIdAndUpdate(metadata.userId, { membershipId: membership._id }, { session });
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
        }
        catch (error) {
            console.error("Webhook processing error:", error.message);
            res.status(400).json({ error: error.message });
        }
        finally {
            await session.endSession();
        }
    }
    else {
        console.log("Non-relevant event ignored:", event.event);
        res.status(200).json({ message: "Event ignored" });
    }
};
module.exports = handlePaystackMembershipWebhook;
//# sourceMappingURL=mebershipwebhook.js.map