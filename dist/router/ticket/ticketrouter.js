"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const fetchActive = require("../../controller/ticket/tickets/fetchActiveStatus");
const fetchHistory = require("../../controller/ticket/tickets/historyTicket");
const validateTicketById = require("../../controller/ticket/tickets/validateTicket");
const userMiddleware = require("../../middleware/userMiddleware");
router.get("/fetch-active-ticket", userMiddleware, fetchActive);
router.get("/fetch-used-ticket", userMiddleware, fetchHistory);
router.post('/validate-ticket/:id', validateTicketById);
module.exports = router;
//# sourceMappingURL=ticketrouter.js.map