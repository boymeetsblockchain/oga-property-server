const mongoose = require("mongoose");

const productModel = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Seller",
    },
    type: {
      type: String,
      enum: ["auction", "sellNow"],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      default: "NGN",
    },
    productName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    style: {
      type: String,
      required: false,
    },
    condition: {
      type: String,
      required: false,
    },
    itemsLeft: {
      type: Number,
      required: true,
      min: 0,
    },
    disappearTime: {
      type: String,
      required: false,
    },
    images: {
      type: [String],
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productModel);
