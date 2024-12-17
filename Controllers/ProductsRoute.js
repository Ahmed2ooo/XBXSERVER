const express = require("express");
const router = express.Router();
// BXB Schemas=======================================================
const Products = require("../Models/Products");
// Middleware for parsing JSON
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Middleware to set headers
const setHeadersMiddleware = (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  next();
};
// Apply middleware to the whole route
router.use(setHeadersMiddleware);

// getAllProducts==============================================
router.get("/", (req, res) => {
  Products.find()
    .then((products) => {
      return res.status(200).json(products);
    })
    .catch((err) => {
      res.status(500).json({ message: "An error occurred: " + err.message });
    });
});

// Get Product by ID endpoint========================================
router.get("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const Product = await Products.findById(productId);

    if (!Product) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.status(200).json(Product);
  } catch (error) {
    res.status(500).json({ message: "An error occurred: " + error.message });
  }
});

// Get Products by Category endpoint
router.get("/category/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const products = await Products.find({ category: category });

    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: "No services found for this category." });
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "An error occurred: " + error.message });
  }
});

module.exports = router;
