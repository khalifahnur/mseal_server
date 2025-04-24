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
  dob: { type: String, required: true },
  physicalAddress: { type: String, required: true },
  city: { type: String, required: true },
  reference: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  expDate: { type: Date },
});

membershipSchema.pre("save", function (next) {
  if (!this.expDate) {
    const date = new Date(this.createdAt || Date.now());
    date.setMonth(date.getMonth() + 1);
    this.expDate = date;
  }
  next();
});

const Membership = model("Membership", membershipSchema);
module.exports = Membership;