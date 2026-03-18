import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
  {
    jti: {
      type: String,
      required: true,
    },
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    expireAt: { type: Date, required: true },
  },
  { timestamps: true },
);

export const TokenModel = mongoose.model("Token", tokenSchema);
