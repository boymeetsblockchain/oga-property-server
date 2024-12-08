const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv").config();
const connectDb = require("./config/db");
const authRoutes = require("./routes/auth");
const errorHandler = require("./middlewares/error");
const sellerRoute = require("./routes/seller");
const cors = require("cors");

const productRoutes = require("./routes/product");
const bankRoutes = require("./routes/bank");

// initialize app
const app = express();

// middlewares
const corsOptions = {
  origin: "*", // Allows all origins
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(errorHandler);
app.use(cookieParser());
// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/seller", sellerRoute);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/bank", bankRoutes);
connectDb();

app.listen(5000, () => {
  console.log("Server Ready");
});

app.get("/", (req, res) => {
  res.send("welcome to oga property server");
});
