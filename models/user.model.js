const mongoose = require("mongoose");

const UserModel = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /.+\@.+\..+/,
    },
    image: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    otp: { type: String },
    otpExpires: { type: Date },
    country: {
      type: String,
      default: "Nigeria",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserModel);
