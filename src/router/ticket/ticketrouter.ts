import express from "express";

const router = express.Router();

const fetchActive = require("../../controller/ticket/tickets/fetchActiveStatus");
const fetchHistory = require("../../controller/ticket/tickets/historyTicket");
const validateTicketById= require("../../controller/ticket/tickets/validateTicket");

const userMiddleware = require("../../middleware/userMiddleware");

router.get("/fetch-active-ticket", userMiddleware, fetchActive);
router.get("/fetch-used-ticket", userMiddleware, fetchHistory);


router.post('/validate-ticket/:id', validateTicketById);
module.exports = router;
