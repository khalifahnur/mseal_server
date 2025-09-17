"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Merchandise = require("../../model/merchandise");
const Admin = require("../../model/admin");
const createMerchandise = async (req, res) => {
    const adminId = req.adminId?.id;
    try {
        if (!adminId) {
            return res.status(400).json({ error: "Admin not authenticated" });
        }
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ error: "Admin info not found" });
        }
        const { name, description, price, stock, category, imageUrl } = req.body;
        if (!name || !price || !stock || !category || !imageUrl) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const existingItem = await Merchandise.findOne({ name });
        if (existingItem) {
            return res.status(401).json({ message: "Item already exists" });
        }
        // Create new merchandise with an object containing all fields
        const item = new Merchandise({
            adminId,
            name,
            description,
            price,
            stock,
            category,
            imageUrl
        });
        await item.save();
        res.status(201).json(item);
    }
    catch (error) {
        console.error("Error creating merchandise:", error);
        res.status(400).json({ error: error.message });
    }
};
module.exports = createMerchandise;
//# sourceMappingURL=createItem.js.map