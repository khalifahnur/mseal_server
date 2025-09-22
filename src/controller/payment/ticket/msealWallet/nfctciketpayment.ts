import { Request, Response } from "express";

const { Request, Response } = require("express");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const Wallet = require("../../../../model/wallet");
const Transaction = require("../../../../model/transaction");
const Ticket = require("../../../../model/ticket");
const Event = require("../../../../model/event");
const publishToTicketQueue = require("../../../../lib/queue/ticket/producer");
const User = require("../../../../model/user");
const decryptWallet = require("../../../../lib/decryptWallet");
const generateTicketId = require("../../../../lib/generateTicketId")

const Joi = require("joi");
const paymentSchema = Joi.object({
  eventId: Joi.string().required(),
  match: Joi.string().required(),
  date: Joi.string().required(),
  venue: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  amount: Joi.number().min(0).required(),
  time: Joi.string().required(),
});

const handleNfcTicketPayment = async (req:Request, res:Response) => {
  const { error: validationError } = paymentSchema.validate(req.body);
  if (validationError) {
    return res.status(400).json({
      error: {
        code: "INVALID_PAYLOAD",
        message: validationError.details[0].message,
      },
    });
  }

  const { eventId, match, date, venue, quantity, amount,time } = req.body;
  const totalAmount = amount * quantity;

  const { id } = req.params;
  const encryptedToken = decodeURIComponent(id);
  const userId = await decryptWallet(encryptedToken);
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({
      error: { code: "INVALID_USER_ID", message: "Invalid user ID" },
    });
  }

  const session = await mongoose.startSession();
  try {
    const result = await session.withTransaction(async () => {
      const [user, wallet, event] = await Promise.all([
        User.findById(userId).session(session),
        Wallet.findOne({ userId, status: "Active" }).session(session),
        Event.findById(eventId).session(session),
      ]);

      if (!user) {
        throw new Error(JSON.stringify({
          code: "USER_NOT_FOUND",
          message: "User not found",
        }));
      }
      if (!wallet) {
        throw new Error(JSON.stringify({
          code: "ACTIVE_WALLET_NOT_FOUND",
          message: "Active wallet not found",
        }));
      }
      if (wallet.balance < totalAmount) {
        throw new Error(JSON.stringify({
          code: "INSUFFICIENT_FUNDS",
          message: "Insufficient funds",
        }));
      }
      if (!event) {
        throw new Error(JSON.stringify({
          code: "EVENT_NOT_FOUND",
          message: "Event not found",
        }));
      }
      if (event.availableTickets < quantity) {
        throw new Error(JSON.stringify({
          code: "INSUFFICIENT_TICKETS",
          message: "Insufficient tickets available",
        }));
      }

      const reference = uuidv4();
      const existingTicket = await Ticket.findOne({
        paymentReference: reference,
      }).session(session);
      if (existingTicket?.paymentStatus === "Completed") {
        throw new Error(JSON.stringify({
          code: "TRANSACTION_ALREADY_PROCESSED",
          message: "Transaction already processed",
        }));
      }

      let ticket = existingTicket;
      if (!ticket) {
        ticket = new Ticket({
          userId,
          ticketId: generateTicketId({
            eventId,
            quantity,
            index: (await Ticket.countDocuments({ eventId }).session(session)) + 1,
            timestamp: new Date(),
          }),
          quantity,
          amount,
          status: "pending",
          paymentReference: reference,
          event: { eventId, match, date, venue ,time},
          paymentStatus: "Pending",
        });
      }

      event.availableTickets -= quantity;
      await event.save({ session });

      ticket.status = "valid";
      ticket.paymentStatus = "Completed";
      await ticket.save({ session });

      wallet.balance -= totalAmount;
      wallet.paymentStatus = "Completed";
      await wallet.save({ session });

      const transaction = new Transaction({
        userId,
        transactionType: "ticket",
        amount: totalAmount,
        status: "Success",
        paymentMethod: "Mseal-wallet",
        reference,
      });
      await transaction.save({ session });

      try {
        await publishToTicketQueue("email_ticket_confirmation", {
          ticketId: ticket._id,
          recipientEmail: user.email,
          metadata: { userId, eventId, match, date, venue, quantity },
        });
      } catch (queueError) {
        console.error("Failed to publish to ticket queue:", queueError);
      }

      return {
        message: "Ticket purchase processed successfully",
        ticketId: ticket.ticketId,
        reference,
      };
    });

    return res.status(200).json(result);
  } catch (error:any) {
    let errorData = { code: "UNKNOWN_ERROR", message: "An error occurred" };
    try {
      errorData = JSON.parse(error.message);
    } catch (e) {
      errorData.message = error.message;
    }
    console.error(`[${errorData.code}] Ticket processing error:`, errorData.message);
    return res.status(errorData.code === "USER_NOT_FOUND" || errorData.code === "EVENT_NOT_FOUND" ? 404 : 400).json({
      error: errorData,
    });
  } finally {
    await session.endSession();
  }
};

module.exports = handleNfcTicketPayment;