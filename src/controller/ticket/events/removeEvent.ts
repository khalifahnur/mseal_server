import { Request, Response } from "express";

const Event = require("../../../model/event");
const Admin = require("../../../model/admin");

interface AuthenticatedRequest extends Request {
  adminId?: {
    id: string;
  };
}

const deleteEvent = async (req: AuthenticatedRequest, res: Response) => {
  const adminId = req.adminId?.id;
  try {
    if (!adminId) {
      return res.status(400).json({ error: "admin not authenticated" });
    }
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: "Admin info not found" });
    }
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({
      message: "Event deleted successfully",
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error deleting event", error: error.message });
  }
};

module.exports = deleteEvent;
