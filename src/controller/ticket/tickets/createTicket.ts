import { Request, Response } from "express";

const Ticket = require("../../../model/ticket");
const Event = require("../../../model/event");

const ticketController = {
  async createTicket(req: Request, res: Response): Promise<void> {
    try {
      const { ticketId, userId, event, seat, quantity } = req.body;

      if (!ticketId || !userId || !event) {
        res
          .status(400)
          .json({ message: "ticketId, userId, and event are required" });
        return;
      }

      if (!Array.isArray(event) || event.length === 0) {
        res.status(400).json({ message: "event must be a non-empty array" });
        return;
      }
      for (const evt of event) {
        if (!evt.match || !evt.date || !evt.venue) {
          res
            .status(400)
            .json({ message: "Each event must have match, date, and venue" });
          return;
        }
      }

      const existingTicket = await Event.findOne({ ticketId });
      if (existingTicket) {
        res
          .status(400)
          .json({ message: "Ticket with this ticketId already exists" });
        return;
      }

      const newTicket = new Ticket({
        ticketId,
        userId,
        event,
        seat,
        quantity,
      });

      const savedTicket = await newTicket.save();
      res.status(201).json({
        message: "Ticket created successfully",
        ticket: savedTicket,
      });
    } catch (error: any) {
      res.status(500).json({
        message: "Error creating ticket",
        error: error.message,
      });
    }
  },
};

module.exports = ticketController;
