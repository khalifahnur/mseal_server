import { Request, Response } from "express";
const Ticket = require("../../../model/ticket");
const encryptQr = require("../../../lib/encryptedQr");
const Event = require("../../../model/event")

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

    const minimalTicketData = tickets
      .map((ticket: any) => ({
        id: ticket._id.toString(),
        event: {
          date: ticket.event[0].date? new Date(ticket.event[0].date).toISOString() : null,
          // match: ticket.event[0]?.match || null,
          // venue: ticket.event[0]?.venue || null,
        },
      }));

    const qrCodes = minimalTicketData.map((ticket:any) => {
      const qrCode = encryptQr([ticket]);
      return qrCode;
    });
    
    res.status(200).json({
      message: "Valid tickets retrieved successfully",
      count: tickets.length,
      tickets,
      qrcode:qrCodes,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error fetching valid tickets",
      error: error.message,
    });
  }
};

module.exports = getValidTickets;
