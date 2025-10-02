import { Request, Response } from "express";

const Ticket = require("../../../model/ticket");
const User = require("../../../model/user");
const sendValidTicketEmail = require("../../../lib/queue/ticket/validTicketProducer");

function truncateToDate(date: any) {
  const utcDate = new Date(
    date.getTime() + date.getTimezoneOffset() * 60 * 1000
  );
  return new Date(utcDate.getFullYear(), utcDate.getMonth(), utcDate.getDate());
}

const validateTicketById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findOne({ _id: id, status: "valid" }).populate("userId");
    if (!ticket) {
      return res.status(400).json({
        success: false,
        message: "Ticket is not valid, expired, or has already been used.",
      });
    }

    const event = ticket.event[0];
    if (!event || !event.date) {
      return res.status(400).json({
        success: false,
        message: "Invalid event data in ticket.",
      });
    }

    const eventDateOnly = truncateToDate(new Date(event.date));
    const todayOnly = truncateToDate(new Date());

    if (eventDateOnly.getTime() !== todayOnly.getTime()) {
      return res.status(400).json({
        success: false,
        message: `Ticket is only valid on ${eventDateOnly.toDateString()}.`,
      });
    }

    ticket.status = "used";
    await ticket.save();

    let recipientEmail: string;
    let fullName: string;

    if (ticket.isGuest) {
      if (!ticket.guestEmail) {
        return res.status(400).json({
          success: false,
          message: "Guest ticket email not found.",
        });
      }
      recipientEmail = ticket.guestEmail;
      fullName = "Guest User";
    } else {
      const user = await User.findById(ticket.userId);
      if (!user || !user.email) {
        console.warn("User or email not found for ticket:", ticket._id);
        return res.status(400).json({
          success: false,
          message: "User email not found.",
        });
      }
      recipientEmail = user.email;
      fullName = `${user.firstName} ${user.lastName}`;
    }

    await sendValidTicketEmail("email_valid_ticket_confirmation", {
      ticketId: ticket.ticketId,
      recipientEmail,
      fullName,
      eventName: event.match,
      venue: event.venue,
      seat: ticket.seat || "N/A",
      quantity: ticket.quantity,
      scanTime: new Date().toISOString(),
      date: event.date,
    });

    return res.status(200).json({
      success: true,
      message: `Ticket validated for ${ticket.quantity} individual(s). Entry granted.`,
    });
  } catch (error:any) {
    console.error("Error validating ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Server error validating ticket.",
      details: error.message,
    });
  }
};

module.exports = validateTicketById;