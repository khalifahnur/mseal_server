"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PAYSTACK_SECRET_KEY = process.env.MSEAL_MEMBERSHIP_PAYSTACK_KEY || "";
//const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const User = require("../../../model/user");
const Membership = require("../../../model/membership");
const limits = require("./checkTier");
const tierPrices = {
    ordinary: 500,
    bronze: 2000,
    silver: 5000,
    gold: 10000,
};
const initiatePayment = async (req, res) => {
    const { phoneNumber, amount, email, membershipTier, dob, city, } = req.body;
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
        if (existingMembership &&
            existingMembership.membershipTier === membershipTier) {
            return res
                .status(400)
                .json({ error: "User already has this membership tier" });
        }
        if (!tierPrices[membershipTier]) {
            return res.status(400).json({ error: `Invalid membership tier: ${membershipTier}` });
        }
        if (!tierPrices[membershipTier]) {
            return res.status(400).json({ error: `Invalid membership tier: ${membershipTier}` });
        }
        let finalAmount;
        if (existingMembership) {
            finalAmount = tierPrices[membershipTier] - tierPrices[existingMembership.membershipTier];
            if (finalAmount <= 0) {
                return res.status(400).json({
                    error: `Cannot upgrade to ${membershipTier} as it is not higher than ${existingMembership.membershipTier}`,
                });
            }
        }
        else {
            finalAmount = tierPrices[membershipTier];
            if (amount && amount !== finalAmount) {
                return res.status(400).json({
                    error: `Provided amount (${amount}) does not match ${membershipTier} price (${finalAmount})`,
                });
            }
        }
        const count = await Membership.countDocuments({
            membershipTier,
            paymentStatus: "Completed",
        });
        if (count >= limits[membershipTier]) {
            return res.status(400).json({
                error: `${membershipTier} tier is full, please select another.`,
            });
        }
        const response = await axios_1.default.post("https://api.paystack.co/charge", {
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
            },
        }, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });
        let membership;
        if (existingMembership) {
            membership = existingMembership;
            membership.membershipTier = membershipTier;
            membership.amount = finalAmount;
            membership.dob = dob || null;
            membership.city = city;
            membership.reference = response.data.data.reference;
            membership.paymentStatus = "Pending";
            membership.status = "Pending";
        }
        else {
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
        }
        await membership.save();
        res.json({
            message: "STK push initiated",
            status: true,
            reference: response.data.data.reference,
        });
    }
    catch (error) {
        console.error("Error initiating payment:", error.response?.data || error.message);
        res.status(500).json({
            error: "Failed to initiate payment",
            details: error.response?.data || error.message,
        });
    }
};
module.exports = initiatePayment;
//# sourceMappingURL=inititatepayment.js.map