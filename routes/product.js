const express = require("express");
const { protectStore } = require("../middlewares/authMIddleware");
const {
  createNewProduct,
  getAllProducts,
  getSingleProduct,
} = require("../controllers/product");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const productRoutes = express.Router();

productRoutes.post(
  "/",
  protectStore,
  upload.array("images", 5),
  createNewProduct
);
productRoutes.get("/", getAllProducts);
productRoutes.get("/:id", getSingleProduct);
module.exports = productRoutes;
