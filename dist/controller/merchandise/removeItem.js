"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Merchandise = require("../../model/merchandise");
const Admin = require("../../model/admin");
const deleteMerchandise = async (req, res) => {
    const adminId = req.adminId?.id;
    try {
        if (!adminId) {
            return res.status(400).json({ error: "Admin not authenticated" });
        }
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ error: "Admin info not found" });
        }
        const { id } = req.params;
        const deletedItem = await Merchandise.findByIdAndDelete(id);
        if (!deletedItem) {
            return res.status(404).json({ error: "Merchandise not found" });
        }
        res.status(200).json({ message: "Merchandise deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
module.exports = deleteMerchandise;
//# sourceMappingURL=removeItem.js.map