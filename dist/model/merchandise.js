"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, model } = mongoose_1.default;
const merchandiseSchema = new Schema({
    adminId: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    description: { type: String, required: false },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
}, { timestamps: true });
const Merchandise = model("Merchandise", merchandiseSchema);
module.exports = Merchandise;
//# sourceMappingURL=merchandise.js.map