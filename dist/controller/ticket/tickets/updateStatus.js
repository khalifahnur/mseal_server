"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const Ticket = require("../../../model/ticket");
const updateTicketStatus = () => {
    node_cron_1.default.schedule("0 0 * * *", async () => {
        const now = new Date();
        try {
            const result = await Ticket.updateMany({ "event.date": { $lt: now }, status: "valid" }, { $set: { status: "used" } });
            console.log(`${result.modifiedCount} tickets marked as expired`);
        }
        catch (error) {
            console.error("Error updating tickets:", error);
        }
    });
};
module.exports = updateTicketStatus;
//# sourceMappingURL=updateStatus.js.map