"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const checkPaymentStatus = async (req, res) => {
    const { reference } = req.query;
    if (!reference) {
        return res.status(400).json({ error: "Reference is required" });
    }
    try {
        const response = await axios_1.default.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
        });
        const status = response.data.data.status; // "success", "pending", "failed"
        res.json({ status });
    }
    catch (error) {
        console.error("Error checking payment status:", error.message);
        res.status(500).json({ error: "Failed to check payment status" });
    }
};
module.exports = checkPaymentStatus;
//# sourceMappingURL=verifypayment.js.map