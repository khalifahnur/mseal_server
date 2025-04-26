"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Staff = require('../../../model/staff');
const getAllStaff = async (req, res) => {
    const adminId = req.adminId?.id;
    try {
        if (!adminId) {
            return res.status(400).json({ error: "admin not authenticated" });
        }
        const staffs = await Staff.find().lean();
        if (!staffs) {
            return res.status(404).json({ error: "staff not found" });
        }
        return res.status(200).json(staffs);
    }
    catch (error) {
        console.error("Error fetching all staff:", error);
        return res.status(500).json({ error: "Server error" });
    }
};
module.exports = getAllStaff;
//# sourceMappingURL=fetchStaff.js.map