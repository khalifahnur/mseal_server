"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User = require("../../model/user");
const Transaction = require("../../model/transaction");
const getLatestTransaction = async (req, res) => {
    const userId = req.user?.id;
    try {
        if (!userId) {
            return res.status(400).json({ error: "User not authenticated" });
        }
        const userInfo = await User.findById(userId);
        if (!userInfo) {
            return res.status(404).json({ error: "User info not found" });
        }
        const latestTransaction = await Transaction.find({
            userId,
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .select("createdAt status amount paymentMethod transactionType")
            .lean();
        return res.status(200).json(latestTransaction);
    }
    catch (error) {
        console.error("Error fetching transactions:", error);
        return res.status(500).json({ error: "Server error" });
    }
};
module.exports = getLatestTransaction;
//# sourceMappingURL=fetchLatestTransaction.js.map