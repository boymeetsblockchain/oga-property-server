const asyncHandler = require("express-async-handler");
const Seller = require("../models/seller.model");
const bcryptjs = require("bcryptjs");
const generateToken = require("../utiils/token");
const sendOTPEmail = require("../services/email");

const generateNumericOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
};

const becomeASeller = asyncHandler(async (req, res) => {
  if (!req.user._id) {
    return res.status(401).json({
      message: "Seller not authorized",
    });
  }

  const user = req.user._id;
  const { storeName, email, state, lga, description, phoneNumber } = req.body;
  if (!storeName || !email || !state || !lga || !description || !phoneNumber) {
    return res.status(400).json({
      message: "Please Fill in all Fields",
    });
  }

  const checkIfStoreExists = await Seller.findOne({
    $or: [{ email: email }, { phoneNumber: phoneNumber }],
  });
  if (checkIfStoreExists) {
    return res.status(401).json({
      message: "Store already exist",
    });
  }

  const otp = generateNumericOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  const createNewStore = new Seller({
    storeName,
    state,
    lga,
    phoneNumber,
    email,
    otp,
    user,
    otpExpires,
    description,
  });

  await createNewStore.save();

  try {
    await sendOTPEmail(email, otp);
  } catch (error) {
    console.error("Error sending OTP email:", error.message);
    return res
      .status(500)
      .json({ message: "User registered, but failed to send OTP" });
  }

  if (createNewStore) {
    return res.status(201).json({
      createNewStore,
      message: "Store created and otp has been sent to your email",
    });
  }
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  if (!otp) {
    res.status(400);
    throw new Error("Otp is Required");
  }

  try {
    const user = await Seller.findOne({ otp });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Seller not found or OTP is incorrect" });
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

const requestOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new Error("Email is Required");
  }

  try {
    const user = await Seller.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Seller not found" });
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
});

const createPassword = asyncHandler(async (req, res) => {
  if (!req.user._id) {
    return res.status(401).json({
      message: "Seller not authorized",
    });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Please fill in all fields",
    });
  }

  const findStore = await Seller.findOne({ email });

  if (!findStore) {
    return res.status(404).json({
      message: "Email not found",
    });
  }

  const hashedPassword = await bcryptjs.hash(password, 10);

  findStore.password = hashedPassword;
  await findStore.save();

  return res.status(200).json({
    message: "Password successfully updated",
  });
});

const loginSeller = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Please fill in all Fields",
    });
  }

  const existingStore = await Seller.findOne({ email });
  if (!existingStore) {
    res.status(400).json({
      message: "User not found, please signup",
    });
  }
  if (!existingStore.isVerified) {
    res.status(400).json({
      message: "Please Verify Your Email",
    });
  }

  const isPasswordCorrect = await bcryptjs.compare(
    password,
    existingStore.password
  );

  const token = generateToken(existingStore._id);

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
  if (existingStore && isPasswordCorrect) {
    const { _id, email } = existingStore;
    res.status(200).json({
      token,
      email,
      _id,
    });
  } else {
    return res.status(400).json({
      message: "Invalid Email or Password",
    });
  }
});

const getStore = asyncHandler(async (req, res) => {
  const sellerId = req.seller._id;

  if (!sellerId) {
    return res.status(401).json({
      message: "Not authorized",
    });
  }

  // Fetch the seller by ID
  const seller = await Seller.findById(sellerId)
    .populate("user", "-password")
    .select("-password");

  if (seller) {
    return res.status(200).json({
      message: "Store retrieved successfully",
      seller,
    });
  } else {
    return res.status(404).json({
      message: "Store not found",
    });
  }
});

module.exports = {
  becomeASeller,
  verifyOtp,
  requestOtp,
  createPassword,
  loginSeller,
  getStore,
};
