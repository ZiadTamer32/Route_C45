import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: function () {
        return !this.attachments.length;
      },
      minLength: 5,
      maxLength: 1000,
      trim: true,
    },
    attachments: [String],
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export const MessageModel = mongoose.model("Message", messageSchema);
