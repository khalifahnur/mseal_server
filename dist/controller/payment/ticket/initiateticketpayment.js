"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const User = require("../../../model/user");
const Ticket = require("../../../model/ticket");
const generateTicketId = require("../../../lib/generateTicketId");
const initiateTicketPayment = async (req, res) => {
    const { eventId, match, date, venue, quantity, amount } = req.body;
    const userId = req.user?.id;
    if (!PAYSTACK_SECRET_KEY) {
        return res.status(500).json({ error: "Paystack secret key is missing" });
    }
    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }
    try {
        const userObj = await User.findById(userId);
        if (!userObj) {
            return res.status(404).json({ error: "User not found" });
        }
        const { email, phoneNumber } = userObj;
        if (!email) {
            return res.status(400).json({ error: "User email is required" });
        }
        if (!phoneNumber) {
            return res.status(400).json({ error: "User phone number is required" });
        }
        const response = await axios_1.default.post("https://api.paystack.co/charge", {
            email,
            amount: amount * 100, // Convert to kobo
            currency: "KES",
            mobile_money: {
                phone: phoneNumber,
                provider: "mpesa",
            },
            metadata: {
                userId,
                eventId,
                match,
                date,
                venue,
                quantity,
            },
        }, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });
        const ticket = new Ticket({
            userId,
            ticketId: generateTicketId({
                eventId: eventId,
                quantity: quantity,
                index: (await Ticket.countDocuments({ eventId })) + 1,
                timestamp: new Date(),
            }),
            quantity: quantity,
            amount: amount,
            status: "pending",
            paymentReference: response.data.data.reference,
            event: {
                eventId,
                date,
                venue,
                match,
            },
            paymentStatus: "Pending",
        });
        await ticket.save();
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
module.exports = initiateTicketPayment;
//# sourceMappingURL=initiateticketpayment.js.map