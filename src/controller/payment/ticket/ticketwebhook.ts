import { Request, Response } from "express";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const Ticket = require("../../../model/ticket");
const User = require("../../../model/user");
const generateTicketId = require("../../../lib/generateTicketId");

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

  if (event.event === "charge.success") {
    console.log("charge success")
    const data = event.data;

    const userId = data.metadata.userId;
    const email = data.customer.email;

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const ticket = new Ticket({
        userId,
        ticketId: generateTicketId({
          eventId: data.metadata.eventId,
          quantity: data.metadata.quantity,
          index:
            (await Ticket.countDocuments({ eventId: data.metadata.eventId })) +
            1,
          timestamp: new Date(),
        }),
        quantity: data.metadata.quantity,
        amount: data.amount / 100,
        status: "valid",
        paymentReference: data.reference,
        event: {
          eventId: data.metadata.eventId,
          date: data.metadata.date,
          venue: data.metadata.venue,
          match: data.metadata.match,
        },
      });

      await ticket.save();
      console.log("🎫 Ticket saved for", email);

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
