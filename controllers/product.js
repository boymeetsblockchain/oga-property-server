const asyncHandler = require("express-async-handler");
const Product = require("../models/product.model");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");

const createNewProduct = asyncHandler(async (req, res) => {
  const sellerId = req.seller._id;

  // Check if seller is authorized
  if (!sellerId) {
    return res.status(401).json({
      message: "Not Authorized",
    });
  }

  // Check if image files are provided
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No image files provided" });
  }

  const {
    type,
    category,
    productName,
    price,
    style,
    itemsLeft,
    disappearTime,
    description,
  } = req.body;

  // Validate required fields
  if (!type || !category || !productName || !price || !itemsLeft) {
    return res.status(400).json({
      message: "Please fill in all required fields",
    });
  }

  try {
    // Upload images to Cloudinary and collect URLs
    const imageUploadPromises = req.files.map((file) =>
      cloudinary.uploader.upload(file.path, {
        folder: "oga-property",
        use_filename: true,
      })
    );

    const uploadedImages = await Promise.all(imageUploadPromises);

    // Collect URLs of uploaded images
    const imageUrls = uploadedImages.map((image) => image.secure_url);

    // Remove local image files

    // Create a new product
    const newProduct = await Product.create({
      seller: sellerId, // Add seller reference
      type,
      category,
      productName,
      price,
      style,
      itemsLeft,
      disappearTime,
      description,
      images: imageUrls, // Store array of image URLs
    });

    req.files.forEach((file) => fs.unlinkSync(file.path));

    // Send a success response
    return res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error(error);

    // Handle potential errors
    return res.status(500).json({
      message: "An error occurred while creating the product",
      error: error.message,
    });
  }
});

const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({}).populate("seller", "-password");

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({
      message: "Error fecthing product",
      error,
    });
  }
});

const getSingleProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      message: "Product not found",
    });
  }
  try {
    const product = await Product.findById({ _id: id }).populate(
      "seller",
      "-password"
    );
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({
      message: "Error fecthing product",
      error,
    });
  }
});
module.exports = {
  createNewProduct,
  getAllProducts,
  getSingleProduct,
};
