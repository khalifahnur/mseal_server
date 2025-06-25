import express from "express";

const router = express.Router();

const fetchLatestTransaction = require("../../controller/transaction/fetchLatestTransaction");
const fetchWalletTransaction = require("../../controller/transaction/fetchWalletTransaction");

const userMiddleware = require("../../middleware/userMiddleware");

router.get("/fetch-latest-transaction", userMiddleware, fetchLatestTransaction);
router.get("/fetch-wallet-transaction", userMiddleware, fetchWalletTransaction);

module.exports = router;
