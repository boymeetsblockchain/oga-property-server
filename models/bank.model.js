const mongoose = require("mongoose");

const bankModel = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Seller",
    },
    name: { type: String, required: true },
    number: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bank", bankModel);
