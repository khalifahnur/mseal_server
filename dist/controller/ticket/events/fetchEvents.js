"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Event = require("../../../model/event");
const getAllEVents = async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 }).lean();
        res.status(200).json({
            message: "Events retrieved successfully",
            count: events.length,
            events,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error fetching events", error: error.message });
    }
};
module.exports = getAllEVents;
//# sourceMappingURL=fetchEvents.js.map