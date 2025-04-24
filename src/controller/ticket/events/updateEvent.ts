import { Request, Response } from "express";

const Event = require("../../../model/event");

const updateEvent = async (req: Request, res: Response) => {
  try {
    const updates = req.body;

    delete updates.createdAt;

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({
      message: "Event updated successfully",
      event,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error updating event", error: error.message });
  }
};

module.exports = updateEvent;
