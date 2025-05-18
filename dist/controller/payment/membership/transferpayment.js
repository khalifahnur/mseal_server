"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const transferToMpesa = async (amount, phoneNumber) => {
    try {
        const recipientName = "khalif noor hillow";
        console.log(`Attempting transfer: ${amount} KES to ${recipientName} (Phone: ${phoneNumber})`);
        const recipientPayload = {
            type: "mobile_money",
            name: recipientName,
            account_number: "+254745194060", // M-Pesa phone number (e.g., "+2547XXXXXXXX")
            bank_code: "MPESA",
            currency: "KES",
        };
        console.log("Recipient payload:", JSON.stringify(recipientPayload, null, 2));
        const recipientResponse = await axios_1.default.post("https://api.paystack.co/transferrecipient", recipientPayload, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });
        console.log("Recipient creation response:", JSON.stringify(recipientResponse.data, null, 2));
        if (!recipientResponse.data.status) {
            throw new Error("Failed to create transfer recipient: " + JSON.stringify(recipientResponse.data));
        }
        const recipientCode = recipientResponse.data.data.recipient_code;
        const transferResponse = await axios_1.default.post("https://api.paystack.co/transfer", {
            source: "balance",
            amount: amount * 100, // Convert to cents
            currency: "KES",
            recipient: recipientCode,
            reason: `Payment to ${recipientName}`,
        }, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });
        if (!transferResponse.data.status) {
            throw new Error("Transfer failed: " + JSON.stringify(transferResponse.data));
        }
        console.log("Transfer successful:", transferResponse.data);
        return transferResponse.data;
    }
    catch (error) {
        console.error("Transfer error details:", error.response?.data || error.message);
        throw error;
    }
};
module.exports = transferToMpesa;
//# sourceMappingURL=transferpayment.js.map