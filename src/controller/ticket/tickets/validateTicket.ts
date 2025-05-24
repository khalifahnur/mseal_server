import { Request, Response } from "express";

const Ticket = require("../../../model/ticket");

function truncateToDate(date: any) {
  const utcDate = new Date(
    date.getTime() + date.getTimezoneOffset() * 60 * 1000
  );
  return new Date(utcDate.getFullYear(), utcDate.getMonth(), utcDate.getDate());
}

const validateTicketById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket is not valid." });
    }

    if (ticket.status !== "valid") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Ticket is not valid or has been used.",
        });
    }

    const eventDate = new Date(ticket.event[0].date);
    const eventDateOnly = truncateToDate(eventDate);

    const today = new Date();
    const todayOnly = truncateToDate(today);

    console.log("eventDateOnly:", eventDateOnly.toISOString());
    console.log("todayOnly:", todayOnly.toISOString());

    if (eventDateOnly.getTime() !== todayOnly.getTime()) {
      return res.status(400).json({
        success: false,
        message: `Ticket is only valid on ${eventDateOnly.toDateString()}.`,
      });
    }

    ticket.status = "used";

    await ticket.save();

    return res.status(200).json({
      success: true,
      message: `This ticket allows entry for ${ticket.quantity} individual's`,
    });
  } catch (error) {
    console.error("Error validating ticket:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error validating ticket." });
  }
};

module.exports = validateTicketById;
