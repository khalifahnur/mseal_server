"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const fetchLatestTransaction = require("../../controller/transaction/fetchLatestTransaction");
const fetchWalletTransaction = require("../../controller/transaction/fetchWalletTransaction");
const userMiddleware = require("../../middleware/userMiddleware");
router.get("/fetch-latest-transaction", userMiddleware, fetchLatestTransaction);
router.get("/fetch-wallet-transaction", userMiddleware, fetchWalletTransaction);
module.exports = router;
//# sourceMappingURL=transactionrouter.js.map