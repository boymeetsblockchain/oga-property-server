const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");
const generateNumericOTP = require("../utiils/otp");
const { hash, compare } = require("bcryptjs");
const sendOTPEmail = require("../services/email");
const generateToken = require("../utiils/token");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const registerUser = asyncHandler(async (req, res) => {
  const { email, phone, country, name } = req.body;

  // Check if all required fields are filled
  if (!email || !phone || !country || !name) {
    return res.status(400).json({ error: "Please fill in all fields" });
  }

  // Checkk if user with the same email or phone already exists
  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) {
    return res
      .status(400)
      .json({ error: "User with this email or phone already exists" });
  }

  if (existingUser) {
    return res.status(400).json({
      error: "User Alreasy Exists",
    });
  }

  const otp = generateNumericOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  const user = await new User({
    email,
    country,
    phone,
    name,
    otp,
    otpExpires,
  });

  await user.save();

  try {
    await sendOTPEmail(email, otp);
  } catch (error) {
    console.error("Error sending OTP email:", error.message);
    return res
      .status(500)
      .json({ message: "User registered, but failed to send OTP" });
  }

  res.status(201).json({
    user: {
      _id: user._id,
      email: user.email,
      phone: user.phone,
    },
  });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  if (!otp) {
    res.status(400);
    throw new Error("Otp is Required");
  }

  try {
    const user = await User.findOne({ otp });

    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found or OTP is incorrect" });
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Account verified" });
  } catch (error) {
    console.error("Error occurred during OTP verification:", error);
    res.status(500).json({
      message: "Server error during OTP verification",
      error: error.message,
    });
  }
});

const requestOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new Error("Email is Required");
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Account already verified" });
    }

    const otp = generateNumericOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;

    await user.save();

    try {
      await sendOTPEmail(user.email, otp);
    } catch (error) {
      console.error("Error sending OTP email:", error.message);
      return res.status(500).json({ message: "Failed to send new OTP" });
    }

    res.status(200).json({ message: "New OTP sent to email." });
  } catch (error) {
    console.error("Error occurred during OTP request:", error);
    res.status(500).json({
      message: "Server error during OTP request",
      error: error.message,
    });
  }
};

const createPassword = asyncHandler(async (req, res) => {
  const { password, email } = req.body;
  if (!password) {
    return res.status(400).json({ error: "Please fill in all fields" });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      message: "User Doesn't exist please create user",
    });
  }

  const hashedPassword = await hash(password, 10);
  console.log(hashedPassword);

  user.password = hashedPassword;
  user.save();

  res.status(200).json({ message: "Password Created" });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      message: "Please Fill in All fields",
    });
  }
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    res.status(400).json({
      message: "User not found, please signup",
    });
  }
  if (!existingUser.isVerified) {
    res.status(400).json({
      message: "Please Verify Your Email",
    });
  }

  const isPasswordCorrect = await compare(password, existingUser.password);

  const token = generateToken(existingUser._id);

  if (isPasswordCorrect) {
    // Send HTTP-only cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      sameSite: "none",
      secure: true,
    });
  }

  if (existingUser && isPasswordCorrect) {
    const { _id, email } = existingUser;
    res.status(200).json({
      token,
      email,
      _id,
    });
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

const getUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    return res.status(400).json({
      message: "User not found",
    });
  }
  try {
    const user = await User.findById(userId).select("-password");
    return res.status(200).json({
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "unable to fetch user",
      error: error,
    });
  }
});

const editProfile = asyncHandler(async (req, res) => {
  const { email, name, password } = req.body;
  const userId = req.user._id;

  // Check if the user is authenticated
  if (!userId) {
    return res.status(400).json({
      message: "User not found",
    });
  }

  // Fetch the user from the database
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      message: "User does not exist",
    });
  }

  // Update fields if provided
  if (email) {
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== userId.toString()) {
      return res.status(409).json({
        message: "Email is already in use by another account",
      });
    }
    user.email = email;
  }

  if (name) {
    user.name = name;
  }

  if (password) {
    const hashedPassword = await hash(password, 10);
    user.password = hashedPassword;
  }

  // Save the updated user
  await user.save();

  return res.status(200).json({
    message: "Profile updated successfully",
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
    },
  });
});

const updateProfilePic = asyncHandler(async (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: "No image file provided" });
  }

  const userId = req.user._id;

  // Check if the user is authenticated
  if (!userId) {
    return res.status(400).json({
      message: "User not found",
    });
  }

  try {
    // Read the image file
    const imagePath = req.file.path;
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: "oga-property",
    });

    const imageUrl = result.secure_url;

    // Find and update the profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Profile not found" });
    }

    user.image = imageUrl;
    await user.save();

    // Delete the local file after upload
    fs.unlinkSync(imagePath);

    res.status(200).json({
      message: "Profile picture updated successfully",
    });
  } catch (error) {
    console.error("Error updating user picture:", error);

    // Delete the local file in case of an error
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: "Something went wrong while updating the user picture",
      error: error.message,
    });
  }
});

module.exports = {
  registerUser,
  verifyOtp,
  requestOtp,
  createPassword,
  loginUser,
  editProfile,
  updateProfilePic,
  getUser,
};
