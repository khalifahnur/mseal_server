import { Request, Response } from "express";
const Event = require("../../../model/event");

const getUpcomingEvents = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const events = await Event.find({
      date: { $gte: today },
    })
      .sort({ date: 1 }) 
      .limit(5)
      .lean();

    res.status(200).json(events);
  } catch (error: any) {
    res.status(500).json({
      message: "Error fetching upcoming events",
      error: error.message,
    });
  }
};

module.exports = getUpcomingEvents;
