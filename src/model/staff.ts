import mongoose from "mongoose";
const { Schema, model } = mongoose;

const staffSchema = new Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: null },
    phoneNumber: { type: String, required: true, unique: true },
    validationcode: { type: String },
    verificationCode: { type: String },
    verificationCodeExpiration: { type: Date },
    validationcodeExpiration: { type: Date },
  },
  { timestamps: true }
);

const staff = model("staffs", staffSchema);
module.exports = staff;
