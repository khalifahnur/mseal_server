"use strict";
// import { Request, Response } from "express";
// import crypto from "crypto";
// import dotenv from "dotenv";
// import mongoose from "mongoose";
// import axios from "axios";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const Ticket = require("../../../model/ticket");
const Transaction = require("../../../model/transaction");
const Event = require("../../../model/event");
const publishToTicketQueue = require("../../../lib/queue/ticket/producer");
const PAYSTACK_SECRET = process.env.MSEAL_MATCH_PAYSTACK_KEY || "";
const handlePaystackWebhook = async (req, res) => {
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
    if (event.event === "charge.success" && event.data.channel === "mobile_money") {
        const { reference, amount, metadata, customer } = event.data;
        const existingTicket = await Ticket.findOne({ paymentReference: reference });
        if (!existingTicket) {
            console.error("Ticket not found for reference:", reference);
            return res.status(404).json({ error: "Ticket not found" });
        }
        if (existingTicket.paymentStatus === "Completed") {
            console.log("Transaction already processed for reference:", reference);
            return res.status(200).json({ message: "Transaction already processed" });
        }
        const session = await mongoose_1.default.startSession();
        try {
            await session.withTransaction(async () => {
                const verifyResponse = await axios_1.default.get(`https://api.paystack.co/transaction/verify/${reference}`, {
                    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
                });
                if (verifyResponse.data.data.status !== "success") {
                    throw new Error("Transaction verification failed");
                }
                // Update ticket
                existingTicket.status = "valid";
                existingTicket.paymentStatus = "Completed";
                await existingTicket.save({ session });
                const event = await Event.findById(metadata.eventId, null, { session });
                if (!event || event.availableTickets < metadata.quantity) {
                    throw new Error(`Insufficient tickets for event ${metadata.eventId}`);
                }
                event.availableTickets -= metadata.quantity;
                await event.save({ session });
                if (!metadata.isGuest) {
                    const transaction = new Transaction({
                        userId: metadata.userId,
                        transactionType: "ticket",
                        amount: amount / 100,
                        status: "Success",
                        paymentMethod: "Mpesa",
                        reference,
                    });
                    await transaction.save({ session });
                }
                await publishToTicketQueue("email_ticket_confirmation", {
                    ticketId: existingTicket._id,
                    recipientEmail: customer.email,
                    metadata,
                });
            });
            console.log("Webhook processed successfully for reference:", reference);
            return res.status(200).json({ message: "Webhook processed successfully" });
        }
        catch (err) {
            console.error("Webhook error for reference:", reference, err);
            return res.status(500).json({ error: "Failed to process webhook", details: err.message });
        }
        finally {
            session.endSession();
        }
    }
    else {
        console.log("Event ignored:", event.event);
        return res.status(200).json({ message: "Event ignored" });
    }
};
module.exports = handlePaystackWebhook;
//# sourceMappingURL=ticketwebhook.js.map