const mongoose = require("mongoose");

const otpModel = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 },
});

module.exports = mongoose.model("Otp", otpModel);
