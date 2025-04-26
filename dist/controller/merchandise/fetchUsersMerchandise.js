"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Merchandise = require("../../model/merchandise");
const getUsersMerchandise = async (req, res) => {
    try {
        const items = await Merchandise.find().lean();
        const responseItems = items.map((item) => ({
            id: item._id,
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            imgUrl: item.imageUrl,
        }));
        res.status(200).json({
            message: "Merchandise retrieved successfully",
            responseItems,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error fetching merchandise", error: error.message });
    }
};
module.exports = getUsersMerchandise;
//# sourceMappingURL=fetchUsersMerchandise.js.map