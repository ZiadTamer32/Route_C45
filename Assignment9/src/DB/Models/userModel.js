import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      validate: {
        validator: function (v) {
          if (v < 18 || v > 60) {
            return false;
          }
          return true;
        },
        message: (props) =>
          `${props.value} is not a valid age! Age must be between 18 and 60.`,
      },
    },
  },
  {
    timestamps: true,
  },
);

const userModel = mongoose.model("User", userSchema);

export default userModel;
