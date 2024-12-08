const express = require("express");
const { protect, protectStore } = require("../middlewares/authMIddleware");
const {
  becomeASeller,
  verifyOtp,
  requestOtp,
  createPassword,
  loginSeller,
  getStore,
} = require("../controllers/seller");

const sellerRoute = express.Router();

sellerRoute.post("/", protect, becomeASeller);
sellerRoute.get("/", protectStore, getStore);
sellerRoute.post("/create-password", protect, createPassword);

sellerRoute.post("/login", loginSeller);
sellerRoute.post("/verify-otp", verifyOtp);
sellerRoute.post("/resend-otp", requestOtp);

module.exports = sellerRoute;
