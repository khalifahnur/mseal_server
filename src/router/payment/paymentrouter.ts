import express from "express";
import { body, validationResult } from "express-validator";

const router = express.Router();

const initiateMembershipPayment = require("../../controller/payment/membership/inititatepayment");
const initiateTicketPayment = require("../../controller/payment/ticket/initiateticketpayment");
const authenticateUser = require("../../middleware/userMiddleware");
const handleWebhook = require("../../controller/payment/membership/webhook");
const checkPaymentStatus = require("../../controller/payment/membership/verifypayment");
const ticketWebhook = require("../../controller/payment/ticket/ticketwebhook");
const inititateOrderPayment = require("../../controller/payment/order/initiateorderpayment");
const orderwebhook = require("../../controller/payment/order/orderwebhook");

const initiatePesapalMembershipPayment = require("../../controller/payment/membership/pesapal/initiatepayment");
const pesapalMembershipPaymentCallback = require("../../controller/payment/membership/pesapal/callback");

router.post("/initiate-payment", authenticateUser, initiateMembershipPayment);
router.post("/membership-web-hook", handleWebhook);
router.get("/payment-status", checkPaymentStatus);
router.post(
  "/initiate-ticket-payment",
  authenticateUser,
  initiateTicketPayment
);
router.post("/ticket-webhook", ticketWebhook);

//orders
router.post("/initiate-order-payment", authenticateUser, inititateOrderPayment);
router.post("/order-webhook", orderwebhook);

//pesapal
//membership
router.post(
  "/pesapal/initiate-payment",
  authenticateUser,
  [
    //body("amount").isFloat({ min: 0.01 }).withMessage("Invalid amount"),
    body("tier").isIn(["bronze", "silver", "gold"]).withMessage("Invalid tier"),
    body("isUpgrade").isBoolean().withMessage("Invalid upgrade flag"),
  ],
  initiatePesapalMembershipPayment
);

router.post("/pesapal/initiate-membership-callback",pesapalMembershipPaymentCallback);

module.exports = router;
