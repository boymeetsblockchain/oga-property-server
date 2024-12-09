const express = require("express");
const multer = require("multer");
const {
  registerUser,
  verifyOtp,
  requestOtp,
  createPassword,
  loginUser,
  getUser,
  editProfile,
  updateProfilePic,
  deleteAllUsers,
} = require("../controllers/auth");
const { protect } = require("../middlewares/authMIddleware");

const upload = multer({ dest: "uploads/" });
const authRoutes = express.Router();
authRoutes.post("/register", registerUser);
authRoutes.post("/login", loginUser);
authRoutes.get("/", protect, getUser);
authRoutes.put("/", protect, editProfile);
authRoutes.put("/image", protect, upload.single("image"), updateProfilePic);
authRoutes.post("/verify-otp", verifyOtp);
authRoutes.post("/resend-otp", requestOtp);
authRoutes.post("/create-password", createPassword);
authRoutes.delete("/", deleteAllUsers);

module.exports = authRoutes;
