"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Membership = require("../../model/membership");
const User = require("../../model/user");
const addMembership = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        const { membershipTier, dob, physicalAddress, city } = req.body;
        if (!membershipTier || !dob || !physicalAddress || !city) {
            return res.status(400).json({ message: "Member data is required" });
        }
        const newMember = new Membership(membershipTier, dob, physicalAddress, city);
        const savedData = await newMember.save();
        await User.findByIdAndUpdate(userId, {
            membershipId: savedData._id,
        });
        res.status(201).json({
            message: "New Member added successfully",
        });
    }
    catch (error) {
        console.error("Error adding new member:", error);
        res.status(500).json({
            message: "Error adding new member",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
module.exports = addMembership;
//# sourceMappingURL=membership.js.map