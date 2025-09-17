"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Order = require("../../model/order");
const completeOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedOrder = await Order.findOneAndUpdate({ _id: id, status: "Processing" }, { $set: { status: "Delivered", updatedAt: new Date() } }, { new: true });
        if (!updatedOrder) {
            return res.status(404).json({
                message: "Order not found or not in Processing status",
            });
        }
        res.status(200).json({
            message: "Order completed successfully",
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error fetching orders", error: error.message });
    }
};
module.exports = completeOrder;
//# sourceMappingURL=updateOrderStatus.js.map