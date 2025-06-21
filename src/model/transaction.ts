import mongoose from "mongoose";
const { Schema, model } = mongoose;

const transactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  transactionType: {
    type: String,
    enum: ["membership", "ticket", "merchandise"],
  },
  amount: { type: Number, require: true },
  status: { type: String, enum: ["Success", "Failed"] },
  paymentMethod: { type: String, enum: ["Mpesa", "Visa", "Mseal-wallet"] },
  reference: { string: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

transactionSchema.index({ userId: 1 });

const Transaction = model("Transaction", transactionSchema);
module.exports = Transaction;
