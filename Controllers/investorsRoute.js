const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
require("dotenv").config();

// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const cookieSession = require("cookie-session");

const sendEmail = require("../middleware/email.js");
const TokenMiddleware = require("../middleware/TokenMiddleware.js");

// BXB Schemas=======================================================
const Users = require("../Models/Users");
const InvestorUpgradeOrders = require("../Models/InvestorUpgradeOrders");

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

// Set up Multer storage configuration===============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderName = req.user.name;
    const folderPath = path.join(`public/InvestorsID`, folderName);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${req.user.name}ID`;

    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// Test
router.get("/", async (req, res) => {
  try {
    res.status(200).json("hi Investor");
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while fetching messages" });
  }
});

// investorUpgrade endpoint============================================
router.post(
  "/investorUpgrade",
  TokenMiddleware,
  upload.fields([{ name: "NationalID", maxCount: 1 }]),
  async (req, res) => {
    try {
      const userName = req.user.name;

      const userExist = await InvestorUpgradeOrders.findOne({
        userName: userName,
      });

      if (userExist) {
        userExist.nationalID = req.files.NationalID[0].path.replace(
          "public" + path.sep,
          ""
        );
        userExist.save().then((e) => {
          return res
            .status(200)
            .json({ message: "The request has been submitted successfully" });
        });
      }

      const application = new InvestorUpgradeOrders({
        userName: userName,
        nationalID: req.files.NationalID[0].path.replace(
          "public" + path.sep,
          ""
        ),
      });
      await application.save().then((e) => {
        return res
          .status(200)
          .json({ message: "The request has been submitted successfully" });
      });
    } catch (error) {
      res.status(500).json({ message: "An error occurred: " + error.message });
    }
  }
);

// SignIn endpoint===================================================
router.post("/SignIn", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const userExist = await Users.findOne({ "email.value": email });
    if (!userExist) {
      return res
        .status(401)
        .json({ message: "email or password is incorrect." });
    }
    const validation = await bcrypt.compare(password, userExist.password);
    if (!validation) {
      return res
        .status(401)
        .json({ message: "email or password is incorrect." });
    }
    // Generate token with user ID and name
    const token = jwt.sign(
      { id: userExist._id, name: userExist.userName },
      process.env.TOKEN_ACCESS,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      AccessToken: token,
      userID: userExist._id,
      userName: userExist.userName,
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred: " + error.message });
  }
});

module.exports = router;
