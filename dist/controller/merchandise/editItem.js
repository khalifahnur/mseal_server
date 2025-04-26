"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Merchandise = require("../../model/merchandise");
const Admin = require("../../model/admin");
const updateMerchandise = async (req, res) => {
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
        const updatedItem = await Merchandise.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        if (!updatedItem) {
            return res.status(404).json({ error: "Merchandise not found" });
        }
        res.status(200).json(updatedItem);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
module.exports = updateMerchandise;
//# sourceMappingURL=editItem.js.map