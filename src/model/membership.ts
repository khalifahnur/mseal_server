import mongoose from "mongoose";
const { Schema, model } = mongoose;

const membershipSchema = new Schema(
  {
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
    dob: { type: String, required: true },
    physicalAddress: { type: String, required: true },
    city: { type: String, required: true },
    reference: { type: String, unique: true, sparse: true },
    expDate: { type: Date },
  },
  { timestamps: true }
);

membershipSchema.index({ membershipTier: 1, status: 1, paymentStatus: 1 });
const Membership = model("Membership", membershipSchema);
module.exports = Membership;
