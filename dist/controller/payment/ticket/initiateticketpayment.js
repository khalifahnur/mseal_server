"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PAYSTACK_SECRET_KEY = process.env.MSEAL_MATCH_PAYSTACK_KEY || "";
const User = require("../../../model/user");
const Ticket = require("../../../model/ticket");
const generateTicketId = require("../../../lib/generateTicketId");
const Event = require("../../../model/event");
// const initiateTicketPayment = async (
//   req: AuthenticatedRequest,
//   res: Response
// ) => {
//   const { eventId, match, date, venue, quantity, amount, time } = req.body;
//   const userId = req.user?.id;
//   if (!PAYSTACK_SECRET_KEY) {
//     return res.status(500).json({ error: "Paystack secret key is missing" });
//   }
//   if (!userId) {
//     return res.status(400).json({ error: "User ID is required" });
//   }
//   try {
//     const userObj = await User.findById(userId);
//     if (!userObj) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     const { email, phoneNumber } = userObj;
//     if (!email) {
//       return res.status(400).json({ error: "User email is required" });
//     }
//     if (!phoneNumber) {
//       return res.status(400).json({ error: "User phone number is required" });
//     }
//     const event = await Event.findById(eventId);
//     if (!event) {
//       return res.status(404).json({ error: "Event not found" });
//     }
//     if (event.availableTickets < quantity) {
//       return res.status(409).json({ 
//         error: "Insufficient tickets available",
//       });
//     }
//     const response = await axios.post(
//       "https://api.paystack.co/charge",
//       {
//         email,
//         amount: amount * 100,
//         currency: "KES",
//         mobile_money: {
//           phone: phoneNumber,
//           provider: "mpesa",
//         },
//         metadata: {
//           userId,
//           eventId,
//           match,
//           date,
//           venue,
//           quantity,
//         },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     const ticket = new Ticket({
//       userId,
//       ticketId: generateTicketId({
//         eventId: eventId,
//         quantity: quantity,
//         index:
//           (await Ticket.countDocuments({ eventId })) + 1,
//         timestamp: new Date(),
//       }),
//       quantity: quantity,
//       amount: amount,
//       status: "pending",
//       paymentReference: response.data.data.reference,
//       event: {
//         eventId,
//         date,
//         venue,
//         match,
//         time,
//       },
//       paymentStatus: "Pending",
//     });
//     await ticket.save()
//     res.json({
//       message: "STK push initiated",
//       status: true,
//       reference: response.data.data.reference,
//     });
//   } catch (error: any) {
//     console.error(
//       "Error initiating payment:",
//       error.response?.data || error.message
//     );
//     res.status(500).json({
//       error: "Failed to initiate payment",
//       details: error.response?.data || error.message,
//     });
//   }
// };
const initiateTicketPayment = async (req, res) => {
    const { eventId, match, date, venue, quantity, amount, time, guestEmail, guestPhone } = req.body;
    const userId = req.user?.id;
    const isGuest = !userId;
    if (!PAYSTACK_SECRET_KEY) {
        return res.status(500).json({ error: "Paystack secret key is missing" });
    }
    try {
        let email;
        let phoneNumber;
        // Validate input for guest and authenticated users
        if (isGuest) {
            if (!guestEmail || !guestPhone) {
                return res.status(400).json({ error: "Email and phone number are required for ticket purchases" });
            }
            email = guestEmail;
            phoneNumber = guestPhone;
        }
        else {
            const userObj = await User.findById(userId);
            if (!userObj) {
                return res.status(404).json({ error: "User not found" });
            }
            email = userObj.email;
            phoneNumber = userObj.phoneNumber;
            if (!email || !phoneNumber) {
                return res.status(400).json({ error: "User email and phone number are required" });
            }
        }
        // Validate event
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        if (event.availableTickets < quantity) {
            return res.status(409).json({ error: "Insufficient tickets available" });
        }
        // Initiate payment with Paystack
        const response = await axios_1.default.post("https://api.paystack.co/charge", {
            email,
            amount: amount * 100, // Convert to kobo
            currency: "KES",
            mobile_money: {
                phone: phoneNumber,
                provider: "mpesa",
            },
            metadata: {
                userId: userId || `guest_${email}`,
                eventId,
                match,
                date,
                venue,
                quantity,
                time,
                isGuest,
            },
        }, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });
        // Create ticket
        const ticket = new Ticket({
            userId: userId || null,
            guestEmail: isGuest ? email : undefined,
            guestPhone: isGuest ? phoneNumber : undefined,
            ticketId: generateTicketId({
                eventId: eventId,
                quantity: quantity,
                index: (await Ticket.countDocuments({ eventId })) + 1,
                timestamp: new Date(),
            }),
            quantity,
            amount,
            status: "pending",
            paymentStatus: "Pending",
            paymentReference: response.data.data.reference,
            event: { eventId, date, venue, match, time },
            isGuest,
        });
        await ticket.save().catch((err) => {
            console.error("Error saving ticket:", err);
            throw new Error("Failed to save ticket");
        });
        return res.json({
            message: "STK push initiated",
            status: true,
            reference: response.data.data.reference,
            isGuest,
        });
    }
    catch (error) {
        console.error("Error initiating payment:", error.response?.data || error.message);
        return res.status(500).json({
            error: "Failed to initiate payment",
            details: error.response?.data || error.message,
        });
    }
};
module.exports = initiateTicketPayment;
//# sourceMappingURL=initiateticketpayment.js.map