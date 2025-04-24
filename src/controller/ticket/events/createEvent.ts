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
    const { name, date, time, venue, ticketPrice, availableTickets } = req.body;

    if (
      !name ||
      !date ||
      !time ||
      !venue ||
      !ticketPrice ||
      !availableTickets
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingEvent = await Event.findOne({ name, date, venue });
    if (existingEvent) {
      return res.status(400).json({ message: "Event already exists" });
    }

    const newEvent = new Event({
      name,
      date,
      time,
      venue,
      ticketPrice,
      totalTickets: availableTickets,
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
