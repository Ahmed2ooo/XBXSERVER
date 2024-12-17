const express = require("express");
const router = express.Router();
// BXB Schemas=======================================================
const Services = require("../Models/Services");
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

// getAllServices==============================================
router.get("/", (req, res) => {
  Services.find()
    .then((services) => {
      console.log(services);
      return res.status(200).json(services);
    })
    .catch((err) => {
      res.status(500).json({ message: "An error occurred: " + err.message });
    });
});

// Get Service by ID endpoint========================================
router.get("/:id", async (req, res) => {
  try {
    const serviceId = req.params.id;
    const service = await Services.findById(serviceId);

    if (!service) {
      return res.status(404).json({ message: "Service not found." });
    }

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: "An error occurred: " + error.message });
  }
});

// Get Services by Category endpoint
router.get("/category/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const services = await Services.find({ category: category });

    if (services.length === 0) {
      return res
        .status(404)
        .json({ message: "No services found for this category." });
    }

    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "An error occurred: " + error.message });
  }
});

module.exports = router;
