import { Request, Response } from "express";

const Event = require("../../../model/event");

const getUpcomingEvents = async (req: Request, res: Response) => {
  try {
    const todayDate = new Date();

    const events = await Event.find({
      date: { $gt: todayDate },
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
