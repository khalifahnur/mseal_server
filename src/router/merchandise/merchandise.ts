import express from "express";

const router = express.Router();

const createMerchandise = require("../../controller/merchandise/createItem");
const getAllMerchandise = require("../../controller/merchandise/fetchItems");
const updateMerchandise = require("../../controller/merchandise/editItem");
const deleteMerchandise = require("../../controller/merchandise/removeItem");
const fetchUsersMerchandise = require("../../controller/merchandise/fetchUsersMerchandise");

const adminMiddleware = require("../../middleware/adminMiddleware");

router.post("/create-new-merchandise", adminMiddleware, createMerchandise);
router.get("/fetch-merchandise", getAllMerchandise);
router.put("/:id/update-merchandise", adminMiddleware, updateMerchandise);
router.delete("/:id/remove-merchandise", adminMiddleware, deleteMerchandise);
router.get("/fetch-users-merchandise", fetchUsersMerchandise);

module.exports = router;
