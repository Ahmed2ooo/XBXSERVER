const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
require("dotenv").config();

const sendNotification = require("../middleware/noti");
const TokenMiddleware = require("../middleware/TokenMiddleware.js");

// BXB Schemas=======================================================
const Admins = require("../Models/Admins");

const Services = require("../Models/Services");
const Products = require("../Models/Products");
const Users = require("../Models/Users");
const Investments = require("../Models/Investments.js");



// async function run() {
//   const hashPassword = await bcrypt.hash("1234", 10);
//   const ss = new Admins({ userName: "admin", password: hashPassword });
//   ss.save();
// }

// run()

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
    const folderName = req.body.title;
    const folderPath = path.join(__dirname, 'public', 'uploads'); // تأكد من صحة المسار هنا

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix =
      file.fieldname === "cover"
        ? `${req.body.title}Cover`
        : `${req.body.title}_Gallery_${Math.round(Math.random() * 100)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

router.get("/", async (req, res) => {
  try {
    res.status(200).json("hi admin");
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while fetching messages" });
  }
});

// SignIn endpoint===================================================
router.post("/SignIn", async (req, res) => {
  try {
    const { userName, password } = req.body;
    // Validate input
    if (!userName || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    // Check if the admin exists
    const adminExist = await Admins.findOne({ userName });
    if (!adminExist) {
      return res
        .status(401)
        .json({ message: "Username or password is incorrect." });
    }
    // Validate password
    const isPasswordValid = await bcrypt.compare(password, adminExist.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Username or password is incorrect." });
    }

    // Generate token
    const token = jwt.sign(
      { id: adminExist._id, name: adminExist.userName },
      process.env.TOKEN_ACCESS,
      { expiresIn: "1h" }
    );

    // Respond with token and user info
    res.status(200).json({
      AccessToken: token,
      adminID: adminExist._id,
      adminName: adminExist.userName,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("SignIn error:", error);
    res.status(500).json({ message: "An error occurred: " + error.message });
  }
});

// Add Service endpoint==============================================
router.post(
  "/addService",
  TokenMiddleware,
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  async (req, res) => {
    console.log(req); 
    try {
      const {
        title,
        category,
        overView,
        totalPrice,
        miniServices,
        instructions,
      } = req.body;

      const gallery = req.files.gallery
        ? req.files.gallery.map((file) =>
            file.path.replace("public" + path.sep, "")
          )
        : [];

      const service = new Services({
        title,
        category,
        overView,
        cover: req.files.cover
          ? req.files.cover[0].path.replace("public" + path.sep, "")
          : "",
        gallery,
        totalPrice,
        miniServices: JSON.parse(miniServices),
        instructions: JSON.parse(instructions),
        uploadedBy: req.user.id,
      });

      await service.save();
      res.status(200).json({ message: "added sucessfully", service });
    } catch (error) {
      res.status(500).json({ message: "An error occurred: " + error.message });
    }
  }
);

// Delete Service and Folder endpoint
router.delete("/deleteService/:id", TokenMiddleware, async (req, res) => {
  try {
    const serviceId = req.params.id;
    const serviceToDelete = await Services.findById(serviceId);

    if (!serviceToDelete) {
      return res.status(404).json({ message: "Service not found." });
    }

    // Delete the service
    await Services.findByIdAndDelete(serviceId);

    // Delete the folder associated with the service
    const folderPath = path.join("public/Services", serviceToDelete.title);
    fs.rm(folderPath, { recursive: true, force: true }, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error deleting folder: " + err.message });
      }

      res
        .status(200)
        .json({ message: "Service and folder deleted successfully." });
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred: " + error.message });
  }
});

// Add Product endpoint==============================================
router.post(
  "/addProduct",
  TokenMiddleware,
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  async (req, res) => {
    console.log(req);
    try {
      const { title, category, overView, price, instructions,shippingCost,customFields } =
        req.body;

      const gallery = req.files.gallery
        ? req.files.gallery.map((file) =>
            file.path.replace("public" + path.sep, "")
          )
        : [];

      const product = new Products({
        title,
        category,
        overView,
        cover: req.files.cover
          ? req.files.cover[0].path.replace("public" + path.sep, "")
          : "",
        gallery,
        price,
        shippingCost,
        instructions: JSON.parse(instructions),
        uploadedBy: req.user.id,
        customFields:JSON.parse(customFields)
      });

      await product.save();
      res.status(200).json({ message: "added sucessfully", product });
    } catch (error) {
      res.status(500).json({ message: "An error occurred: " + error.message });
    }
  }
);

// Delete Product and Folder endpoint
router.delete("/deleteProduct/:id", TokenMiddleware, async (req, res) => {
  try {
    const productId = req.params.id;
    const productToDelete = await Products.findById(productId);

    if (!productToDelete) {
      return res.status(404).json({ message: "Service not found." });
    }

    // Delete the service
    await Products.findByIdAndDelete(productId);

    // Delete the folder associated with the service
    const folderPath = path.join("public/Products", productToDelete.title);
    fs.rm(folderPath, { recursive: true, force: true }, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error deleting folder: " + err.message });
      }

      res
        .status(200)
        .json({ message: "Product and folder deleted successfully." });
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred: " + error.message });
  }
});

//Add Invesment==========================
router.post(
  "/addInvesment",
  TokenMiddleware,
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const { title, category,description, priceOfShersAvailableForInvesment,price, numberOfShares,
        numberofSharesRemaining,totalProjectSize,highNumberOfShares,lowNumberOfShares,numberOfSharesPurchases } =
        req.body;

      const gallery = req.files.gallery
        ? req.files.gallery.map((file) =>
            file.path.replace("public" + path.sep, "")
          )
        : [];

      const invesment = new Investments({
        title,
         category,
         description,
          priceOfShersAvailableForInvesment,
          price, numberOfShares,
        numberofSharesRemaining,
        totalProjectSize,
        highNumberOfShares,
        lowNumberOfShares,
        numberOfSharesPurchases,
        cover: req.files.cover
          ? req.files.cover[0].path.replace("public" + path.sep, "")
          : "",
        gallery,
        createdBy: req.user.id,
      });

      await invesment.save();
      res.status(200).json({ message: "added sucessfully", invesment });
    } catch (error) {
      res.status(500).json({ message: "An error occurred: " + error.message });
    }
  }
);



// Delete Invesment and Folder endpoint
router.delete("/deleteInvesment/:id", TokenMiddleware, async (req, res) => {
  try {
    const invesmentId = req.params.id;
    const invesmentToDelete = await Investments.findById(invesmentId);

    if (!invesmentToDelete) {
      return res.status(404).json({ message: "invesment not found." });
    }

   
    await Investments.findByIdAndDelete(invesmentId);

   
    const folderPath = path.join("public/uploads", invesmentToDelete.title);
    fs.rm(folderPath, { recursive: true, force: true }, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error deleting folder: " + err.message });
      }

      res
        .status(200)
        .json({ message: "Invesment and folder deleted successfully." });
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred: " + error.message });
  }
});


//send notification endpoint

router.post("/prodcast/notification", TokenMiddleware, async (req, res) => {
  try {
    const message = req.body.message;
    const userss = await Users.find();
    userss.map((e) => {
      sendNotification(e.userName, e.email.value, message);
    });

    res.status(200).json({ message: "prodcasting Done" });
  } catch (error) {
    res.status(500).json({ message: "An error occurred: " + error.message });
  }
});

module.exports = router;
