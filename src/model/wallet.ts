import mongoose from "mongoose";
const { Schema, model } = mongoose;

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
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending',
  },
  prepaidReference:{type:String,unique:true,default:""}
},
{ timestamps: true }
);

walletSchema.index({ balance: 1, userId: 1, status: 1 });

const Wallet = model("Wallet", walletSchema);
module.exports = Wallet;
