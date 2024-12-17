const express = require("express");
const router = express.Router();
// BXB Schemas=======================================================
const Investments = require("../Models/Investments");
// Middleware for parsing JSON
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const TokenMiddleware = require("../middleware/TokenMiddleware.js");

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

// getAllInvestments==============================================
router.get("/", (req, res) => {
  Investments.find()
    .then((Investment) => {
      return res.status(200).json(Investment);
    })
    .catch((err) => {
      res.status(500).json({ message: "An error occurred: " + err.message });
    });
});

// Get Investment by ID endpoint========================================
router.get("/:id", async (req, res) => {
  try {
    const InvestmentId = req.params.id;
    const Investment = await Investments.findById(InvestmentId);

    if (!Investment) {
      return res.status(404).json({ message: "Investment not found." });
    }

    res.status(200).json(Investment);
  } catch (error) {
    res.status(500).json({ message: "An error occurred: " + error.message });
  }
});

// Get Investments by Category endpoint
router.get("/category/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const Investmentss = await Investments.find({ category: category });

    if (Investmentss.length === 0) {
      return res
        .status(404)
        .json({ message: "No Investments found for this category." });
    }
    res.status(200).json(Investmentss);
  } catch (error) {
    res.status(500).json({ message: "An error occurred: " + error.message });
  }
});

module.exports = router;
