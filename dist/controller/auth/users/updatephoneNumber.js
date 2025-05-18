"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User = require("../../../model/user");
const updatePhoneNumber = async (req, res) => {
    const userId = req.user?.id;
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({ error: "Phone number is required" });
        }
        const existingUser = await User.findOne({ phoneNumber });
        if (existingUser && existingUser._id.toString() !== userId) {
            return res.status(409).json({ error: 'Phone number is already in use' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (user.phoneNumber == phoneNumber) {
            return res
                .status(404)
                .json({
                error: "Phone number already exist,please use another phone number !",
            });
        }
        user.phoneNumber = phoneNumber;
        await user.save();
        return res.json({ message: "Phone number updated successfully" });
    }
    catch (err) {
        console.error("Update phone number error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};
module.exports = updatePhoneNumber;
//# sourceMappingURL=updatephoneNumber.js.map