import express from "express";
const router = express.Router();

const getAllOrder = require("../../controller/orders/fetchAllOrders");
const updateOrder = require("../../controller/orders/updateOrderStatus");



router.get("/fetch-all-orders", getAllOrder);
router.put("/update-order/:id",  updateOrder);

module.exports = router;
