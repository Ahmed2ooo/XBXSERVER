const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const SuperAdmin = require("./Controllers/superAdminRoute");
const Admin = require("./Controllers/adminRoute");
const User = require("./Controllers/userRoute");
const Services = require("./Controllers/ServicesRoute");
const Products = require("./Controllers/ProductsRoute");
const Investors = require("./Controllers/investorsRoute");
const Investments = require("./Controllers/InvestmentsRoute");
const Payments = require("./Controllers/paymentsRoute");
const Chat = require("./Controllers/chatRoute");

// Create an Express app
const app = express();

// Middleware for parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
// Set the view engine to EJS
app.set("view engine", "ejs");
// Set the views directory
app.set("views", path.join(__dirname, "Views"));
//cors 
app.use(cors({ origin: '*' }));  // السماح بالوصول من جميع المجالات


// Routes
 
app.use("/superAdmin", SuperAdmin);
app.use("/admin", Admin);
app.use("/user", User); 
app.use("/services", Services);
app.use("/products", Products);
app.use("/investors", Investors);
app.use("/investments", Investments);
app.use("/payments", Payments);
app.use("/chats",Chat);

 
// Serve static files
app.use(express.static(path.join(__dirname, "public")));


 
// MongoDB connection
async function run() {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.leiu5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
}  

// Connect MongoDB 
run();
let port = process.env.PORT || 3001;
// Start server
app.listen(port, () => {
  console.log(`SERVER RUN ON PORT ${port}`);
});

// Default route
app.get("/", (req, res) => {
  res.status(200).send("XBX Server");
});

app.get("/pp", (req, res) => {
  res.render("paymentDone");
  // res.status(200).send("XBX Server");
});

// Export the app for Vercel serverless functions
module.exports = app;
