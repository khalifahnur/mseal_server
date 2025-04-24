import { Request, Response } from "express";

const Ticket = require("../../../model/ticket");

const validateTicketById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Find ticket by _id
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found." });
    }

    if (ticket.status !== "valid") {
      return res
        .status(400)
        .json({ success: false, message: "Ticket is not valid." });
    }

    // Extract event date and convert to local date only (ignoring time)
    const eventDate = new Date(ticket.event[0].date);
    const eventDateOnly = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate()
    );

    const today = new Date();
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // Compare dates
    if (eventDateOnly.getTime() !== todayOnly.getTime()) {
      return res.status(400).json({
        success: false,
        message: `Ticket is only valid on ${eventDateOnly.toDateString()}.`,
      });
    }

    // Mark ticket as used
    ticket.status = "used";
    await ticket.save();

    return res.status(200).json({
      success: true,
      message: `Ticket is valid and has been marked as used.${ticket.quantity}`,
    });
  } catch (error) {
    console.error("Error validating ticket:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error validating ticket." });
  }
};

module.exports = validateTicketById;
