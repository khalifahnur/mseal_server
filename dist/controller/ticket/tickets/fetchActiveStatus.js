"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Ticket = require("../../../model/ticket");
const encryptQr = require("../../../lib/encryptedQr");
const getValidTickets = async (req, res) => {
    const userId = req.user?.id;
    try {
        const tickets = await Ticket.find({ userId, status: "valid" })
            .sort({ createdAt: -1 })
            .lean();
        const minimalTicketData = tickets
            .map((ticket) => ({
            id: ticket._id.toString(),
            event: {
                date: ticket.event[0].date ? new Date(ticket.event[0].date).toISOString() : null,
                // match: ticket.event[0]?.match || null,
                // venue: ticket.event[0]?.venue || null,
            },
        }));
        const qrCodes = minimalTicketData.map((ticket) => {
            const qrCode = encryptQr([ticket]);
            return qrCode;
        });
        res.status(200).json({
            message: "Valid tickets retrieved successfully",
            count: tickets.length,
            tickets,
            qrcode: qrCodes,
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