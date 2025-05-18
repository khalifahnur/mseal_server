"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Ticket = require("../../../model/ticket");
const encryptedTicket = require("../../../lib/encryptedQr");
const getValidTickets = async (req, res) => {
    const userId = req.user?.id;
    try {
        const tickets = await Ticket.find({ userId, status: "valid" })
            .sort({ createdAt: -1 })
            .lean();
        const minimalTicketData = tickets.map((ticket) => ({
            _id: ticket._id,
            event: {
                date: ticket.event?.date,
            },
        }));
        const qrcode = encryptedTicket(minimalTicketData);
        res.status(200).json({
            message: "Valid tickets retrieved successfully",
            count: tickets.length,
            tickets,
            qrcode,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching valid tickets",
            error: error.message,
        });
    }
};
module.exports = getValidTickets;
//# sourceMappingURL=fetchActiveStatus.js.map