import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return v !== v.toUpperCase();
        },
        message: (props) =>
          `${props.value} - Title must not be entirely uppercase.`,
      },
    },
    content: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const noteModel = mongoose.model("Note", noteSchema);

export default noteModel;
