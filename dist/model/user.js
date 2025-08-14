"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, model } = mongoose_1.default;
const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, require: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    phoneNumber: { type: String, required: false },
    membershipId: { type: Schema.Types.ObjectId, ref: 'Membership', default: null },
    walletId: { type: Schema.Types.ObjectId, ref: 'Wallet', default: null },
    createdAt: { type: Date, default: Date.now },
    verificationCode: { type: String },
    verificationCodeExpiration: { type: Date },
});
userSchema.index({ email: 1, phoneNumber: 1, membershipId: 1 });
const User = model("User", userSchema);
module.exports = User;
//# sourceMappingURL=user.js.map