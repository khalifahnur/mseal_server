"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Staff = require("../../../model/staff");
const Admin = require("../../../model/admin");
const deleteStaffAccount = async (req, res) => {
    const adminId = req.admin?.id;
    try {
        if (!adminId) {
            return res.status(400).json({ error: "Admin not authenticated" });
        }
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ error: "Admin info not found" });
        }
        const { id } = req.params;
        const deletedItem = await Staff.findByIdAndDelete(id);
        if (!deletedItem) {
            return res.status(404).json({ error: "Staff not found" });
        }
        res.status(200).json({ message: "Staff account deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
module.exports = deleteStaffAccount;
//# sourceMappingURL=removeStaff.js.map