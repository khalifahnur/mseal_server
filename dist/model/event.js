"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, model } = mongoose_1.default;
const eventSchema = new Schema({
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true },
    ticketPrice: { type: Number, required: true },
    totalTickets: { type: Number, required: true },
    availableTickets: { type: Number },
    homeLogoUrl: { type: String },
    opponentLogoUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
});
const Event = model("Event", eventSchema);
module.exports = Event;
//# sourceMappingURL=event.js.map