"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Event = require("../../../model/event");
const getTodayEvents = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const events = await Event.find({
            date: {
                $gte: today,
                $lt: tomorrow
            }
        })
            .sort({ date: 1 })
            .lean();
        res.status(200).json(events);
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching today's events",
            error: error.message,
        });
    }
};
module.exports = getTodayEvents;
//# sourceMappingURL=fetchTodayEvents.js.map