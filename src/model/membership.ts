import mongoose from "mongoose";
const { Schema, model } = mongoose;

const membershipSchema = new Schema({
  membershipTier: {
    type: String,
    required: true,
    enum: ["none", "bronze", "silver", "gold"],
    default: "none",
  },
  amount: { type: Number, required: true },
  points: { type: Number, default: 0 },
  status: {
    type: String,
    required: true,
    enum: ["valid", "denied"],
    default: "valid",
  },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  dob: { type: String, required: true },
  physicalAddress: { type: String, required: true },
  city: { type: String, required: true },
  reference: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  expDate: { type: Date },
});

const Membership = model("Membership", membershipSchema);
module.exports = Membership;