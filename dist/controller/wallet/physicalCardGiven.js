"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Wallet = require("../../model/wallet");
const decryptWallet = require("../../lib/decryptWallet");
const updatePhysicalNfcGiven = async (req, res) => {
    const adminId = req.adminId?.id;
    const { walletId } = req.params;
    const { physicalNfcGiven } = req.body;
    try {
        if (!adminId) {
            return res.status(401).json({ message: "Admin not authenticated" });
        }
        if (typeof physicalNfcGiven !== "boolean") {
            return res.status(400).json({ message: "physicalNfcGiven must be a boolean" });
        }
        // Decode and decrypt walletId
        const encryptedToken = decodeURIComponent(walletId);
        const decryptedUserId = await decryptWallet(encryptedToken);
        console.log("Decrypted userId:", decryptedUserId);
        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(decryptedUserId)) {
            return res.status(400).json({ message: "Invalid userId format" });
        }
        const userId = new mongoose.Types.ObjectId(decryptedUserId);
        // Check if wallet exists
        const wallet = await Wallet.findOneAndUpdate({ userId }, { physicalNfcGiven }, { new: true });
        if (!wallet) {
            console.log("No wallet found for userId:", userId);
            return res.status(404).json({ message: "Wallet not found" });
        }
        return res.status(200).json({
            message: "physicalNfcGiven updated successfully",
            wallet,
        });
    }
    catch (error) {
        console.error("Error updating physicalNfcGiven:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
module.exports = updatePhysicalNfcGiven;
//# sourceMappingURL=physicalCardGiven.js.map