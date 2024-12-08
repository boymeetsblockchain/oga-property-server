const express = require("express");
const { protectStore } = require("../middlewares/authMIddleware");
const { addBank, deleteBank, getBanks } = require("../controllers/bank");
const bankRoutes = express.Router();

bankRoutes.post("/", protectStore, addBank);
bankRoutes.delete("/:id", deleteBank);
bankRoutes.get("/", protectStore, getBanks);

module.exports = bankRoutes;
