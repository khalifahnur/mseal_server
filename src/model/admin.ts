import mongoose from "mongoose";
const { Schema, model } = mongoose;

const adminSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, require: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  verificationCode: { type: String },
  verificationCodeExpiration: { type: Date },
});

adminSchema.index({email:1,phoneNumber:1,password:1});

const Admin = model("Admin", adminSchema);
module.exports = Admin;
