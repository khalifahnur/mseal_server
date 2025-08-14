"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const User = require("../../../model/user");
const Wallet = require("../../../model/wallet");
dotenv_1.default.config();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const initiatewalletpayment = async (req, res) => {
    const { amount, phoneNumber } = req.body;
    const userId = req.user?.id;
    if (!PAYSTACK_SECRET_KEY) {
        return res.status(500).json({ error: "Paystack secret key is missing" });
    }
    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }
    try {
        const userObj = await User.findById(userId);
        const wallet = await Wallet.findOne({ userId });
        if (!userObj) {
            return res.status(404).json({ error: "User not found" });
        }
        const { email, firstName, lastName } = userObj;
        if (!email) {
            return res.status(400).json({ error: "User email is required" });
        }
        if (!phoneNumber) {
            return res.status(400).json({ error: "User phone number is required" });
        }
        if (!wallet) {
            return res.status(400).json({ error: "wallet not found" });
        }
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
                firstName,
                lastName,
            },
        }, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });
        wallet.paymentStatus = "Pending";
        wallet.prepaidReference = response.data.data.reference;
        await wallet.save();
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
module.exports = initiatewalletpayment;
//# sourceMappingURL=initiatewalletpayment.js.map