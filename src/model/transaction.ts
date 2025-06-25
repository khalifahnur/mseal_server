import mongoose from "mongoose";
const { Schema, model } = mongoose;

const transactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  transactionType: {
    type: String,
    enum: ["membership", "ticket", "merchandise","prepaid"],
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
