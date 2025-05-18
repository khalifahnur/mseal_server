"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Merchandise = require("../../model/merchandise");
const getAllMerchandise = async (req, res) => {
    try {
        const items = await Merchandise.find().lean();
        res.status(200).json({
            message: "Merhcandise retrieved successfully",
            count: items.length,
            items,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error fetching events", error: error.message });
    }
};
module.exports = getAllMerchandise;
//# sourceMappingURL=fetchItems.js.map