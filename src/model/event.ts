import mongoose from "mongoose";
const { Schema, model } = mongoose;

const eventSchema = new Schema({
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  date: { type: Date, required: true },
  time:{type:String,required:true},
  venue: { type: String, required: true },
  ticketPrice:{type:Number,required: true},
  totalTickets:{type:Number,required:true},
  availableTickets:{type:Number},
  homeLogoUrl:{type:String},
  opponentLogoUrl:{type:String},
  createdAt: { type: Date, default: Date.now },
});

const Event = model("Event", eventSchema);
module.exports = Event;
