"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User = require("../../../model/user");
const encryptQr = require("../../../lib/encryptedQr");
const encryptWallet = require("../../../lib/encryptWallet");
const Wallet = require("../../../model/wallet");
const getMemberInfo = async (req, res) => {
    const adminId = req.adminId?.id;
    try {
        if (!adminId) {
            return res.status(400).json({ error: "admin not authenticated" });
        }
        const users = await User.find()
            .populate("membershipId", "membershipTier amount status createdAt expDate")
            .lean();
        if (!users || users.length === 0) {
            return res.status(404).json({ error: "No users found" });
        }
        const responseData = await Promise.all(users.map(async (user) => {
            const walletInfo = await Wallet.findOne({ userId: user._id }).lean();
            return {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                membershipTier: user.membershipId?.membershipTier || null,
                membershipId: user.membershipId?._id || null,
                createdAt: user.membershipId?.createdAt || null,
                expDate: user.membershipId?.expDate || null,
                qrcode: user.membershipId
                    ? encryptQr(user.membershipId._id.toString())
                    : null,
                ecryptWalletId: user._id ? encryptWallet(user._id.toString()) : null,
                cardNumber: walletInfo?._id || null,
                physicalIdIssued: user.physicalIdIssued,
                lockRequested: user.lockRequested,
            };
        }));
        return res.status(200).json(responseData);
    }
    catch (error) {
        console.error("Error fetching user info:", error);
        return res.status(500).json({ error: "Server error" });
    }
};
module.exports = getMemberInfo;
//# sourceMappingURL=fetchMemberInfo.js.map