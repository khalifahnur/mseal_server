"use strict";
const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const eventSchema = new Schema({
    eventId: { type: String, required: true },
    match: { type: String, required: true },
    date: { type: Date, required: true },
    venue: { type: String, required: true },
    time: { type: String, required: true },
});
const ticketSchema = new Schema({
    ticketId: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    guestEmail: { type: String },
    guestPhone: { type: String },
    event: { type: eventSchema, required: true },
    seat: { type: String },
    quantity: { type: Number, default: 1 },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["valid", "pending", "used"], default: "pending" },
    paymentStatus: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Pending" },
    paymentReference: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    isGuest: { type: Boolean, default: false },
});
ticketSchema.index({ ticketId: 1, status: 1, paymentReference: 1 });
const Ticket = model("Ticket", ticketSchema);
module.exports = Ticket;
//# sourceMappingURL=ticket.js.map