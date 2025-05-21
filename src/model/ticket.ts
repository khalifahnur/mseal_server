import mongoose from "mongoose";
const { Schema, model } = mongoose;

const eventSchema = new Schema({
  eventId:{type:String, required:true},
  match: { type: String, required: true },
  date: { type: Date, required: true },
  venue: { type: String, required: true },
});

const ticketSchema = new Schema({
  ticketId: { type: String, required: true },
  userId: { type: String, required: true },
  event: { type: [eventSchema], required: true },
  seat: { type: String },
  quantity: { type: Number, default: 1 },
  status: { type: String, enum: ["valid", "pending", "used"], default: "valid" },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending',
  },
  paymentReference: String,
  createdAt: { type: Date, default: Date.now },
});

ticketSchema.index({ ticketId: 1, status: 1, paymentReference:1});

const Ticket = model("Ticket", ticketSchema);
module.exports = Ticket;