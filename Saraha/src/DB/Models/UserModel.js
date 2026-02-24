import mongoose from "mongoose";
import { genderEnum, roleEnum } from "../../Common/Enums/enums.js";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 15,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      required: true,
      enum: Object.values(genderEnum),
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(roleEnum),
      default: roleEnum.user,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: String,
    otpExpiresAt: Date,
    DOB: Date,
  },
  { timestamps: true },
);

export const UserModel = mongoose.model("User", userSchema);
