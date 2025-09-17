"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, model } = mongoose_1.default;
const membershipSchema = new Schema({
    membershipTier: {
        type: String,
        required: true,
        enum: ["none", "ordinary", "bronze", "silver", "gold"],
        default: "none",
    },
    amount: { type: Number, required: true },
    points: { type: Number, default: 0 },
    status: {
        type: String,
        required: true,
        enum: ["Active", "Inactive", "Pending"],
        default: "Inactive",
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Completed", "Failed"],
        default: "Pending",
    },
    dob: { type: String, required: false },
    city: { type: String, required: true },
    reference: { type: String, unique: true, sparse: true },
    expDate: { type: Date },
}, { timestamps: true });
membershipSchema.index({ membershipTier: 1, status: 1, paymentStatus: 1 });
const Membership = model("Membership", membershipSchema);
module.exports = Membership;
//# sourceMappingURL=membership.js.map