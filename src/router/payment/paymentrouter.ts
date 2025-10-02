import express from "express";
import { body, validationResult } from "express-validator";

const router = express.Router();

const initiateMembershipPayment = require("../../controller/payment/membership/inititatepayment");
const initiateTicketPayment = require("../../controller/payment/ticket/initiateticketpayment");
const authenticateUser = require("../../middleware/userMiddleware");
const ticketMiddleware = require("../../middleware/ticketMiddleware");
const handleWebhook = require("../../controller/payment/membership/mebershipwebhook");
const checkPaymentStatus = require("../../controller/payment/membership/verifypayment");
const ticketWebhook = require("../../controller/payment/ticket/ticketwebhook");
const inititateOrderPayment = require("../../controller/payment/order/initiateorderpayment");
const orderwebhook = require("../../controller/payment/order/orderwebhook");

const intitateMsealWalletOrderPayment = require("../../controller/payment/order/msealWallet/initiateorderpayment");
const initiateMsealWalletTicketPayment = require("../../controller/payment/ticket/msealWallet/initiateticketpayment");
const initiateWalletTopup = require("../../controller/payment/wallet/initiatewalletpayment");
const walletWebhook = require("../../controller/payment/wallet/walletwebhook");
const initiateNfcPayment = require("../../controller/payment/ticket/msealWallet/nfctciketpayment");

router.post(
  "/initiate-membership-payment",
  authenticateUser,
  initiateMembershipPayment
);
router.post("/membership-web-hook", handleWebhook);
router.get("/payment-status", checkPaymentStatus);
router.post(
  "/initiate-ticket-payment",
  ticketMiddleware,
  initiateTicketPayment
);
router.post("/ticket-webhook", ticketWebhook);

//orders
router.post("/initiate-order-payment", authenticateUser, inititateOrderPayment);
router.post("/order-webhook", orderwebhook);

//mseal-wallet
router.post(
  "/mseal-wallet/initiate-order-payment",
  authenticateUser,
  intitateMsealWalletOrderPayment
);
router.post(
  "/mseal-wallet/initiate-ticket-payment",
  authenticateUser,
  initiateMsealWalletTicketPayment
);
router.post("/mseal-wallet-topup", authenticateUser, initiateWalletTopup);
router.post("/mseal-wallet-webhook", walletWebhook);
router.post("/mseal-wallet/ticket-payment/:id",initiateNfcPayment)

module.exports = router;
