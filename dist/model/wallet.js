"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, model } = mongoose_1.default;
const walletSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    balance: { type: Number, require: true },
    currency: { type: String, default: "KES" },
    status: {
        type: String,
        enum: ["Active", "Inactive", "Suspended", "Pending"],
        default: "Inactive",
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Completed", "Failed"],
        default: "Pending",
    },
    prepaidReference: { type: String, unique: true, sparse: true },
    expDate: { type: Date },
    physicalNfcGiven: { type: Boolean, default: false },
}, { timestamps: true });
walletSchema.index({ balance: 1, userId: 1, status: 1 });
const Wallet = model("Wallet", walletSchema);
module.exports = Wallet;
//# sourceMappingURL=wallet.js.map