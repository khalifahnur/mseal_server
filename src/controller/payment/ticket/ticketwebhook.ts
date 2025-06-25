import { Request, Response } from "express";
import crypto from "crypto";
import dotenv from "dotenv";
import mongoose from "mongoose";
import axios from "axios";

dotenv.config();

const Ticket = require("../../../model/ticket");
const Transaction = require("../../../model/transaction");
const Event = require("../../../model/event");
const publishToTicketQueue = require("../../../lib/queue/ticket/producer");

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";

const handlePaystackWebhook = async (req: Request, res: Response) => {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  const paystackSignature = req.headers["x-paystack-signature"];
  if (hash !== paystackSignature) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const event = req.body;

  if (
    event.event === "charge.success" &&
    event.data.channel === "mobile_money"
  ) {
    const { reference, amount, metadata, customer } = event.data;

    const existingTicket = await Ticket.findOne({
      paymentReference: reference,
    });

    if (existingTicket?.paymentStatus === "Completed") {
      return res.status(200).json({ message: "Transaction already processed" });
    }

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const verifyResponse = await axios.get(
          `https://api.paystack.co/transaction/verify/${reference}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
          }
        );
        if (verifyResponse.data.data.status !== "success") {
          throw new Error("Transaction verification failed");
        }

        const tickets = await Ticket.findOne(
          { paymentReference: reference },
          null,
          { session }
        );
        if (!tickets) {
          throw new Error("Ticket not found");
        }

        // if (tickets.totalAmount * 100 !== amount) {
        //   throw new Error("Amount mismatch");
        // }

        const event = await Event.findById(metadata.eventId, null, {
          session,
        });
        if (!event || event.availableTickets < metadata.quantity) {
          throw new Error(`Insufficient ticket ${metadata.productId}`);
        }
        event.availableTickets -= metadata.quantity;
        await event.save({ session });

        (tickets.status = "valid"), (tickets.paymentStatus = "Completed");

        await tickets.save({ session });

        const transaction = new Transaction({
          userId: metadata.userId,
          transactionType: "ticket",
          amount: amount/100,
          status: "Success",
          paymentMethod: "Mpesa",
          reference,
        });
        await transaction.save({ session });

        await publishToTicketQueue("email_ticket_confirmation", {
          ticketId: tickets._id,
          recipientEmail: customer.email,
          metadata,
        });
      });

      res.status(200).send("Webhook processed successfully");
    } catch (err) {
      console.error("Webhook error:", err);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  } else {
    res.status(200).send("Event ignored");
  }
};

module.exports = handlePaystackWebhook;
