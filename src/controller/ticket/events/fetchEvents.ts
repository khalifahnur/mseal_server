import { Request, Response } from "express";

const Event = require("../../../model/event");

const getAllEVents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find().sort({ date: 1 }).lean();

    res.status(200).json({
      message: "Events retrieved successfully",
      count: events.length,
      events,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching events", error: error.message });
  }
};

module.exports = getAllEVents;
