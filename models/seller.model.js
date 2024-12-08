const mongoose = require("mongoose");

const SellerModel = new mongoose.Schema({
  storeName: {
    required: true,
    type: String,
  },
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  bank: { type: mongoose.Schema.Types.ObjectId, required: false, ref: "Bank" },
  email: {
    required: true,
    type: String,
    unique: true,
  },
  phoneNumber: {
    required: true,
    type: String,
    unique: true,
  },
  state: {
    required: true,
    type: String,
  },
  lga: {
    required: true,
    type: String,
  },
  description: {
    required: true,
    type: String,
  },
  password: {
    type: String,
  },
  nin: {
    type: String,
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Seller", SellerModel);
