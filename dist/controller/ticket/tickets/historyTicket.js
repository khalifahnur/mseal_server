"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Ticket = require("../../../model/ticket");
const getTicketHistory = async (req, res) => {
    const userId = req.user?.id;
    try {
        const tickets = await Ticket.find({ userId, status: "used" })
            .sort({ createdAt: -1 })
            .lean();
        res.status(200).json({
            message: "Ticket history retrieved successfully",
            count: tickets.length,
            tickets,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching ticket history",
            error: error.message,
        });
    }
};
module.exports = getTicketHistory;
//# sourceMappingURL=historyTicket.js.map