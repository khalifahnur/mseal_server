"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, model } = mongoose_1.default;
const transactionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    transactionType: {
        type: String,
        enum: ["membership", "ticket", "merchandise", "prepaid"],
    },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["Success", "Failed"] },
    paymentMethod: { type: String, enum: ["Mpesa", "Visa", "Mseal-wallet"] },
    reference: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
});
transactionSchema.index({ userId: 1 });
const Transaction = model("Transaction", transactionSchema);
module.exports = Transaction;
//# sourceMappingURL=transaction.js.map