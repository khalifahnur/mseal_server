"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Event = require("../../../model/event");
const updateEvent = async (req, res) => {
    try {
        const updates = req.body;
        delete updates.createdAt;
        const event = await Event.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        res.status(200).json({
            message: "Event updated successfully",
            event,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error updating event", error: error.message });
    }
};
module.exports = updateEvent;
//# sourceMappingURL=updateEvent.js.map