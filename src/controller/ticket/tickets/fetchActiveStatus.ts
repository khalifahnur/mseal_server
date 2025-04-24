import { Request, Response } from "express";
const Ticket = require("../../../model/ticket");
const encryptedTicket = require("../../../lib/encryptedQr");

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

const getValidTickets = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    const tickets = await Ticket.find({ userId, status: "valid" })
      .sort({ createdAt: -1 })
      .lean();

    const minimalTicketData = tickets.map((ticket: any) => ({
      _id: ticket._id,
      event: {
        date: ticket.event?.date,
      },
    }));

    const qrcode = encryptedTicket(minimalTicketData);
    res.status(200).json({
      message: "Valid tickets retrieved successfully",
      count: tickets.length,
      tickets,
      qrcode,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error fetching valid tickets",
      error: error.message,
    });
  }
};

module.exports = getValidTickets;
