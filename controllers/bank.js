const Bank = require("../models/bank.model");
const asyncHandler = require("express-async-handler");
const Seller = require("../models/seller.model");
// Add a new bank
const addBank = asyncHandler(async (req, res) => {
  const sellerid = req.seller._id;
  if (!sellerid) {
    return res.status(401).json({ message: "Not Authorized" });
  }
  const { name, number } = req.body;

  // Validate input
  if (!name || !number) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate account
  const existingBank = await Bank.findOne({ number });
  if (existingBank) {
    return res.status(409).json({ message: "Bank already exists" });
  }

  // Create a new bank record
  const newBank = await Bank.create({
    name,
    seller: sellerid,
    number,
  });

  return res.status(201).json({
    message: "Bank added successfully",
    bank: newBank,
  });
});

// Delete a bank
const deleteBank = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find and delete the bank
  const bank = await Bank.findByIdAndDelete(id);

  if (!bank) {
    return res.status(404).json({ message: "Bank not found" });
  }

  return res.status(200).json({ message: "Bank deleted successfully" });
});

// Get all banks
const getBanks = asyncHandler(async (req, res) => {
  const sellerid = req.seller._id; // Extract the seller ID from the request

  console.log(sellerid);
  // Check if the seller ID exists in the request. If not, return an authorization error
  if (!sellerid) {
    return res.status(401).json({ message: "Not Authorized" });
  }

  try {
    // Query the Seller model to find the seller by ID and populate the 'bank' field
    const seller = await Seller.findById(sellerid).populate("bank", "bank");

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Return the response with the bank data
    return res.status(200).json({
      message: "Banks retrieved successfully",
      seller,
    });
  } catch (error) {
    // Handle any errors during the database query
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = {
  addBank,
  deleteBank,
  getBanks,
};
