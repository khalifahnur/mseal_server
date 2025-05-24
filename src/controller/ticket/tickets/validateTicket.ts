import { Request, Response } from "express";

const Ticket = require("../../../model/ticket");

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
        .json({ success: false, message: "Ticket is not valid or has been used." });
    }

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

    if (eventDateOnly !== todayOnly) {
      return res.status(400).json({
        success: false,
        message: `Ticket is only valid on ${eventDateOnly.toDateString()}.`,
      });
    }

    ticket.status = "used";
    await ticket.save();

    return res.status(200).json({
      success: true,
      message: `Ticket is valid .${ticket.quantity}`,
    });
  } catch (error) {
    console.error("Error validating ticket:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error validating ticket." });
  }
};

module.exports = validateTicketById;
