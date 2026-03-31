import mongoose from "mongoose";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
} from "../../Common/Enums/enums.js";

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
      sparse: true,

      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === ProviderEnum.system;
      },
    },
    phone: {
      type: String,
      required: function () {
        return this.provider === ProviderEnum.system;
      },
      unique: true,
      sparse: true,
    },
    gender: {
      type: String,
      required: function () {
        return this.provider === ProviderEnum.system;
      },
      enum: Object.values(GenderEnum),
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(RoleEnum),
      default: RoleEnum.user,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.system,
    },
    visitCount: {
      type: Number,
      default: 0,
    },
    profilePic: String,
    gallery: [String],
    coverPics: [String],
    DOB: Date,
    changeCreditTime: Date,
    twoStepVerification: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model("User", userSchema);
