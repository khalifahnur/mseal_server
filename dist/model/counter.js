"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, model } = mongoose_1.default;
const counterSchema = new Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
});
const Counter = model("Counter", counterSchema);
module.exports = Counter;
//# sourceMappingURL=counter.js.map