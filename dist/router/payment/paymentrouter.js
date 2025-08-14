"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
const initiateMembershipPayment = require("../../controller/payment/membership/inititatepayment");
const initiateTicketPayment = require("../../controller/payment/ticket/initiateticketpayment");
const authenticateUser = require("../../middleware/userMiddleware");
const handleWebhook = require("../../controller/payment/membership/mebershipwebhook");
const checkPaymentStatus = require("../../controller/payment/membership/verifypayment");
const ticketWebhook = require("../../controller/payment/ticket/ticketwebhook");
const inititateOrderPayment = require("../../controller/payment/order/initiateorderpayment");
const orderwebhook = require("../../controller/payment/order/orderwebhook");
const initiatePesapalMembershipPayment = require("../../controller/payment/membership/pesapal/initiatepayment");
const pesapalMembershipPaymentCallback = require("../../controller/payment/membership/pesapal/callback");
const intitateMsealWalletOrderPayment = require("../../controller/payment/order/msealWallet/initiateorderpayment");
const initiateMsealWalletTicketPayment = require("../../controller/payment/ticket/msealWallet/initiateticketpayment");
const initiateWalletTopup = require("../../controller/payment/wallet/initiatewalletpayment");
const walletWebhook = require("../../controller/payment/wallet/walletwebhook");
const initiateNfcPayment = require("../../controller/payment/ticket/msealWallet/nfctciketpayment");
router.post("/initiate-membership-payment", authenticateUser, initiateMembershipPayment);
router.post("/membership-web-hook", handleWebhook);
router.get("/payment-status", checkPaymentStatus);
router.post("/initiate-ticket-payment", authenticateUser, initiateTicketPayment);
router.post("/ticket-webhook", ticketWebhook);
//orders
router.post("/initiate-order-payment", authenticateUser, inititateOrderPayment);
router.post("/order-webhook", orderwebhook);
//pesapal
//membership
router.post("/pesapal/initiate-payment", authenticateUser, [
    //body("amount").isFloat({ min: 0.01 }).withMessage("Invalid amount"),
    (0, express_validator_1.body)("tier").isIn(["bronze", "silver", "gold"]).withMessage("Invalid tier"),
    (0, express_validator_1.body)("isUpgrade").isBoolean().withMessage("Invalid upgrade flag"),
], initiatePesapalMembershipPayment);
router.post("/pesapal/initiate-membership-callback", pesapalMembershipPaymentCallback);
//mseal-wallet
router.post("/mseal-wallet/initiate-order-payment", authenticateUser, intitateMsealWalletOrderPayment);
router.post("/mseal-wallet/initiate-ticket-payment", authenticateUser, initiateMsealWalletTicketPayment);
router.post("/mseal-wallet-topup", authenticateUser, initiateWalletTopup);
router.post("/mseal-wallet-webhook", walletWebhook);
router.post("/mseal-wallet/ticket-payment/:id", initiateNfcPayment);
module.exports = router;
//# sourceMappingURL=paymentrouter.js.map