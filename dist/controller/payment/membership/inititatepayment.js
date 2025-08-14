"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const Membership = require("../../../model/membership");
const initiatePayment = async (req, res) => {
    const { phoneNumber, amount, email, membershipTier, dob, physicalAddress, city, } = req.body;
    const userId = req.user?.id;
    if (!PAYSTACK_SECRET_KEY) {
        return res.status(500).json({ error: "Paystack secret key is missing" });
    }
    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }
    try {
        const response = await axios_1.default.post("https://api.paystack.co/charge", {
            email,
            amount: amount * 100,
            currency: "KES",
            mobile_money: {
                phone: phoneNumber,
                provider: "mpesa",
            },
            metadata: {
                userId,
                membershipTier,
                dob,
                physicalAddress,
                city,
            },
        }, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });
        const membership = new Membership({
            userId,
            membershipTier,
            dob: dob || null,
            physicalAddress,
            city,
            amount,
            reference: response.data.data.reference,
            paymentStatus: "Pending",
            status: "Pending",
        });
        await membership.save();
        res.json({
            message: "STK push initiated",
            status: true,
            reference: response.data.data.reference,
        });
    }
    catch (error) {
        console.error("Error initiating payment:", error.response?.data || error.message);
        res
            .status(500)
            .json({
            error: "Failed to initiate payment",
            details: error.response?.data || error.message,
        });
    }
};
module.exports = initiatePayment;
//# sourceMappingURL=inititatepayment.js.map