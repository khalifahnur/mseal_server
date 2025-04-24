import { Request, Response } from "express";
const Ticket = require("../../../model/ticket");

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

const getTicketHistory = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  try {
    const tickets = await Ticket.find({ userId,status: "used" })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      message: "Ticket history retrieved successfully",
      count: tickets.length,
      tickets,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error fetching ticket history",
      error: error.message,
    });
  }
};

module.exports = getTicketHistory;
