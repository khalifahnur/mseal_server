"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Ticket = require("../../../model/ticket");
const User = require("../../../model/user");
const sendValidTicketEmail = require("../../../lib/queue/ticket/validTicketProducer");
function truncateToDate(date) {
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
    return new Date(utcDate.getFullYear(), utcDate.getMonth(), utcDate.getDate());
}
const validateTicketById = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await Ticket.findOneAndUpdate({ _id: id, status: "valid" }, { $set: { status: "used" } }, { new: true }).populate("userId");
        if (!ticket) {
            return res.status(400).json({
                success: false,
                message: "Ticket is not valid, expired, or has already been used.",
            });
        }
        const event = ticket.event[0];
        const eventDateOnly = truncateToDate(new Date(event.date));
        const todayOnly = truncateToDate(new Date());
        if (eventDateOnly.getTime() !== todayOnly.getTime()) {
            return res.status(400).json({
                success: false,
                message: `Ticket is only valid on ${eventDateOnly.toDateString()}.`,
            });
        }
        const user = await User.findById(ticket.userId);
        await sendValidTicketEmail("email_valid_ticket_confirmation", {
            ticketId: ticket.ticketId,
            recipientEmail: user.email,
            fullName: `${user.firstName} ${user.lastName}`,
            eventName: event.match,
            venue: event.venue,
            seat: ticket.seat,
            quantity: ticket.quantity,
            scanTime: new Date().toISOString(),
            date: event.date,
        });
        return res.status(200).json({
            success: true,
            message: `Ticket validated for ${ticket.quantity} individual(s). Entry granted.`,
        });
    }
    catch (error) {
        console.error("Error validating ticket:", error);
        return res
            .status(500)
            .json({ success: false, message: "Server error validating ticket." });
    }
};
module.exports = validateTicketById;
//# sourceMappingURL=validateTicket.js.map