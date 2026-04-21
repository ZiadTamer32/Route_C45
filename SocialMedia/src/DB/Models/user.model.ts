import mongoose from "mongoose";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
} from "../../Common/enums/index.js";
import { IUser } from "../../Common/interface/index.js";

const userSchema = new mongoose.Schema<IUser>(
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
      required: function (): boolean {
        return this.provider === ProviderEnum.System;
      },
    },
    phone: {
      type: String,
      required: function (): boolean {
        return this.provider === ProviderEnum.System;
      },
      unique: true,
    },
    gender: {
      type: Number,
      enum: GenderEnum,
      required: function (): boolean {
        return this.provider === ProviderEnum.System;
      },
    },
    role: {
      type: Number,
      required: true,
      enum: RoleEnum,
      default: RoleEnum.User,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: Number,
      enum: ProviderEnum,
      default: ProviderEnum.System,
    },
    visitCount: {
      type: Number,
      default: 0,
    },
    profilePic: String,
    coverPic: String,
    gallery: [String],
    DOB: Date,
    changeCreditTime: Date,
    twoStepVerification: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model<IUser>("User", userSchema);
