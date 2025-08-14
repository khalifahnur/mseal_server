"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User = require("../../../model/user");
const Membership = require("../../../model/membership");
const Wallet = require("../../../model/wallet");
const encryptQr = require("../../../lib/encryptedQr");
const getUserInfo = async (req, res) => {
    const userId = req.user?.id;
    try {
        if (!userId) {
            return res.status(400).json({ error: "User not authenticated" });
        }
        const userInfo = await User.findById(userId);
        if (!userInfo) {
            return res.status(404).json({ error: "User info not found" });
        }
        let membershipInfo = null;
        let qrcode = null;
        if (userInfo.membershipId) {
            membershipInfo = await Membership.findById(userInfo.membershipId);
            qrcode = encryptQr(userInfo.membershipId);
        }
        const walletInfo = await Wallet.findOne({ userId }).lean();
        const responseData = {
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            email: userInfo.email,
            phoneNumber: userInfo.phoneNumber,
            membershipTier: membershipInfo?.membershipTier || null,
            membershipId: userInfo.membershipId || null,
            createdAt: membershipInfo?.createdAt || null,
            expDate: membershipInfo?.expDate || null,
            qrcode,
            balance: walletInfo?.balance ?? 0,
            walletId: walletInfo?._id ?? null,
        };
        return res.status(200).json(responseData);
    }
    catch (error) {
        console.error("Error fetching user info:", error);
        return res.status(500).json({ error: "Server error" });
    }
};
module.exports = getUserInfo;
//# sourceMappingURL=fetchuserinfo.js.map