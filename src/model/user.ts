import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, require: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  phoneNumber: { type: String, required: false, unique:true },
  membershipId: { type: String, default:null},
  createdAt: { type: Date, default: Date.now },
  verificationCode: { type: String },
  verificationCodeExpiration: { type: Date },
});

userSchema.index({email:1,phoneNumber:1,membershipId:1});

const User = model("User", userSchema);
module.exports = User;
