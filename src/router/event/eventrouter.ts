const express = require("express");
const router = express.Router();

const createEvent = require("../../controller/ticket/events/createEvent");
const getAllEvent = require("../../controller/ticket/events/fetchEvents");
const updateEvent = require("../../controller/ticket/events/updateEvent");
const deleteEvent = require("../../controller/ticket/events/removeEvent");
const getUpcomingEvents = require("../../controller/ticket/events/fetchUpcomingEvents");
const todayEvents = require("../../controller/ticket/events/fetchTodayEvents");
const authenticateAdmin = require("../../middleware/adminMiddleware");


router.post("/create-event", authenticateAdmin, createEvent);
router.get("/fetch-all-events", getAllEvent);
router.put("/update-event/:id", authenticateAdmin, updateEvent);
router.delete("/delete-event/:id", authenticateAdmin, deleteEvent);
router.get("/fetch-upcoming-events", getUpcomingEvents);
router.get("/fetch-today-events", todayEvents)

module.exports = router;
