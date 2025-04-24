import mongoose from "mongoose";
const { Schema, model } = mongoose;

const merchandiseSchema = new Schema(
  {
    adminId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: false },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
  },
  { timestamps: true }
);

const Merchandise = model("Merchandise", merchandiseSchema);
module.exports = Merchandise;
