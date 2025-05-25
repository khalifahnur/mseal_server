import { Request, Response } from "express";

const Event = require("../../../model/event");
const Admin = require("../../../model/admin");

interface AuthenticatedRequest extends Request {
  adminId?: {
    id: string;
  };
}
const createEvent = async (req: AuthenticatedRequest, res: Response) => {
  const adminId = req.adminId?.id;
  try {
    if (!adminId) {
      return res.status(400).json({ error: "admin not authenticated" });
    }
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: "Admin info not found" });
    }
    const {
      homeTeam,
      awayTeam,
      date,
      time,
      venue,
      ticketPrice,
      availableTickets,
      homeLogoUrl,
      opponentLogoUrl,
    } = req.body;

    if (
      !homeTeam ||
      !awayTeam ||
      !date ||
      !time ||
      !venue ||
      !ticketPrice ||
      !availableTickets
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingEvent = await Event.findOne({
      homeTeam,
      awayTeam,
      date,
      venue,
    });
    if (existingEvent) {
      return res.status(400).json({ message: `Event already exists :${homeTeam} vs ${awayTeam}, ${date} at ${venue}` });
    }

    const newEvent = new Event({
      homeTeam,
      awayTeam,
      date,
      time,
      venue,
      ticketPrice,
      totalTickets: availableTickets,
      availableTickets,
      homeLogoUrl,
      opponentLogoUrl,
    });

    const savedEvent = await newEvent.save();
    res.status(201).json({
      message: "Event created successfully",
      event: savedEvent,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error creating event", error: error.message });
  }
};

module.exports = createEvent;
