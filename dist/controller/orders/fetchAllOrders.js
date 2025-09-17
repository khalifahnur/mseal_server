"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Order = require("../../model/order");
const getActiveOrders = async (req, res) => {
    try {
        const items = await Order.find()
            .sort({ createdAt: -1 })
            .lean()
            .populate("userInfo", "firstName lastName email phoneNumber")
            .populate({
            path: "items.productId",
            select: "imageUrl name description",
        });
        res.status(200).json({
            message: " orders retrieved successfully",
            count: items.length,
            items,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error fetching orders", error: error.message });
    }
};
module.exports = getActiveOrders;
//# sourceMappingURL=fetchAllOrders.js.map