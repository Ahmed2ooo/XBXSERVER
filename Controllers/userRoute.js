const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const cookieSession = require("cookie-session");

const router = express.Router();
require("dotenv").config();


const sendEmail = require("../middleware/email.js");
const TokenMiddleware = require("../middleware/TokenMiddleware.js");

// BXB Schemas=======================================================
const Users = require("../Models/Users");
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


// GET all messages
router.get("/", async (req, res) => {
  try {
    res.status(200).json("hi user");
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while fetching messages" });
  }
});

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

router.post("/Signup", async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    // Check for missing fields
    if (!userName || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if user or email already exists
    const userExist = await Users.findOne({ userName: userName });
    if (userExist) {
      return res.status(409).json({ message: "Username already exists." });
    }

    const emailExist = await Users.findOne({ "email.value": email });
    if (emailExist) {
      return res.status(409).json({ message: "Email already exists." });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    // Create a new user
    const user = new Users({
      userName,
      password: hashPassword,
      email: {
        value: email,
        verifctionCode: Math.floor(100000 + Math.random() * 900000),
        confirmation: false,
      },
    });
    await user.save();
    sendEmail(userName, email, user.email.verifctionCode).then((m) => {
      res.status(201).json({ message: "user created" });
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred: " + error.message });
  }
});

router.post("/emailVerification", async (req, res) => {
  try {
    const { userName, code } = req.body;

    // Check for missing fields
    if (!userName || !code) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if user already exists
    const userExist = await Users.findOne({ userName: userName });
    if (!userExist) {
      return res.status(409).json({ message: "Username not exists." });
    }

    const verify = userExist.email.verifctionCode == code;

    if (verify) {
      userExist.email.confirmation = true;
      await userExist.save();
      res.status(200).json({ message: "Email verified" });
    } else {
      res.status(400).json({ message: "Invalid verification code" });
    }
  } catch (error) {
    res.status(500).json({ message: "An error occurred: " + error.message });
  }
});

router.post("/resendEmail", async (req, res) => {
  try {
    const { userName } = req.body;

    // Check for missing fields
    if (!userName) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if user already exists
    const userExist = await Users.findOne({ userName: userName });
    if (!userExist) {
      return res.status(409).json({ message: "Username not exists." });
    }

    userExist.email.verifctionCode = Math.floor(
      100000 + Math.random() * 900000
    );
    await userExist.save().then((e) => {
      sendEmail(
        userExist.userName,
        userExist.email.value,
        userExist.email.verifctionCode
      ).then((e) => {
        res.status(200).json({ message: "Email sent successfully" });
      });
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred: " + error.message });
  }
});

router.get("/Eng.Mohammed", async (req, res) => {
  const users = await Users.find({});
  console.log(users);
  res.json(users);
});

module.exports = router;
