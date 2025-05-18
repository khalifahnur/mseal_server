"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const initiateMembershipPayment = require("../../controller/payment/membership/inititatepayment");
const initiateTicketPayment = require("../../controller/payment/ticket/initiateticketpayment");
const authenticateUser = require("../../middleware/userMiddleware");
const handleWebhook = require("../../controller/payment/membership/webhook");
const checkPaymentStatus = require("../../controller/payment/membership/verifypayment");
const ticketWebhook = require("../../controller/payment/ticket/ticketwebhook");
const inititateOrderPayment = require("../../controller/payment/order/initiateorderpayment");
const orderwebhook = require("../../controller/payment/order/orderwebhook");
router.post("/initiate-payment", authenticateUser, initiateMembershipPayment);
router.post("/membership-web-hook", handleWebhook);
router.get("/payment-status", checkPaymentStatus);
router.post("/initiate-ticket-payment", authenticateUser, initiateTicketPayment);
router.post("/ticket-webhook", ticketWebhook);
//orders
router.post("/initiate-order-payment", authenticateUser, inititateOrderPayment);
router.post("/order-webhook", orderwebhook);
module.exports = router;
//# sourceMappingURL=paymentrouter.js.map