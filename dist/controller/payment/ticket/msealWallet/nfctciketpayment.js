"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Wallet = require("../../../../model/wallet");
const Transaction = require("../../../../model/transaction");
const generateReference = require("../../../../lib/generateReference");
const Ticket = require("../../../../model/ticket");
const generateTicketId = require("../../../../lib/generateTicketId");
const Event = require("../../../../model/event");
const publishToTicketQueue = require("../../../../lib/queue/ticket/producer");
const User = require("../../../../model/user");
const decryptWallet = require("../../../../lib/decryptWallet");
const handleNfcTicketPayment = async (req, res) => {
    const { eventId, match, date, venue, quantity, amount } = req.body;
    const totalAmount = amount * quantity;
    // Decrypt userId from request params
    const { id } = req.params;
    const encryptedToken = decodeURIComponent(id);
    const userId = decryptWallet(encryptedToken);
    if (!mongoose_1.default.isValidObjectId(userId)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
    }
    console.log(req.body);
    if (!userId ||
        !eventId ||
        !match ||
        !date ||
        !venue ||
        !quantity ||
        !amount) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    const session = await mongoose_1.default.startSession();
    try {
        await session.withTransaction(async () => {
            const [user, wallet, event] = await Promise.all([
                User.findById(userId).session(session),
                Wallet.findOne({ userId, status: "Active" }).session(session),
                Event.findById(eventId).session(session),
            ]);
            if (!user) {
                throw new Error("User not found");
            }
            if (!wallet) {
                throw new Error("Active wallet not found");
            }
            if (wallet.balance < totalAmount) {
                throw new Error("Insufficient funds");
            }
            if (!event) {
                throw new Error("Event not found");
            }
            if (event.availableTickets < quantity) {
                throw new Error("Insufficient tickets available");
            }
            const reference = generateReference(userId);
            const existingTicket = await Ticket.findOne({
                paymentReference: reference,
            }).session(session);
            if (existingTicket?.paymentStatus === "Completed") {
                throw new Error("Transaction already processed");
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
                    event: {
                        eventId,
                        match,
                        date,
                        venue,
                    },
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
            await publishToTicketQueue("email_ticket_confirmation", {
                ticketId: ticket._id,
                recipientEmail: user.email,
                metadata: {
                    userId,
                    eventId,
                    match,
                    date,
                    venue,
                    quantity,
                },
            });
            return res.status(200).json({
                message: "Ticket purchase processed successfully",
                ticketId: ticket.ticketId,
                reference,
            });
        });
    }
    catch (error) {
        console.error("Ticket processing error:", error.message);
        return res.status(400).json({ error: error.message });
    }
    finally {
        await session.endSession();
    }
};
module.exports = handleNfcTicketPayment;
//# sourceMappingURL=nfctciketpayment.js.map