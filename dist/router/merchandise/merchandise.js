"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
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
//# sourceMappingURL=merchandise.js.map