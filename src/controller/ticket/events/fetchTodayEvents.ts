import { Request, Response } from "express";

const Event = require("../../../model/event");

const getTodayEvents = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const events = await Event.find({
      date: { 
        $gte: today,
        $lt: tomorrow
      }
    })
    .sort({ date: 1 })
    .lean();

    res.status(200).json(events);
  } catch (error: any) {
    res.status(500).json({
      message: "Error fetching today's events",
      error: error.message,
    });
  }
};

module.exports = getTodayEvents;