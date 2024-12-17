const express = require("express");
const router = express.Router();
require("dotenv").config();


// BXB Schemas=======================================================
const Users = require("../Models/Users");

// Middleware for parsing JSON
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const TokenMiddleware = require("../middleware/TokenMiddleware.js");
const Investments = require("../Models/Investments.js");

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

// PaymentServices==============================================
router.post("/services", TokenMiddleware, async (req, res) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

  const selectedServices = req.body.miniServices;
  const { serviceID, serviceTitle } = req.body;

  if (selectedServices.length === 0) {
    return res
      .status(400)
      .json({ message: "Please select at least one service" });
  }
  const priceData = selectedServices.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.title,
      },
      unit_amount: item.price * 100, // Amount in cents
    },
    quantity: 1,
  }));

  const session = await stripe.checkout.sessions.create({
    line_items: priceData,
    mode: "payment",
    success_url: `${process.env.BASE_URL}/payments/complete?session_id={CHECKOUT_SESSION_ID}&userName=${req.user.name}&serviceID=${serviceID}&serviceTitle=${serviceTitle}`,
    cancel_url: `${process.env.BASE_URL}/cancel`,
  });

  res.send(session.url);
});

router.get("/complete", async (req, res) => {
  try {
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const [session, lineItems] = await Promise.all([
      stripe.checkout.sessions.retrieve(req.query.session_id, {
        expand: ["payment_intent.payment_method"],
      }),
      stripe.checkout.sessions.listLineItems(req.query.session_id),
    ]);

    // Check the payment status
    if (session.payment_status === "paid") {
      const userExist = await Users.findOne({ userName: req.query.userName });

      const miniServices = lineItems.data.map((item) => ({
        title: item.description,
        price: item.amount_total / 100,
      }));

      userExist.userService.push({
        serviceId: req.query.serviceID,
        serviceTitle: req.query.serviceTitle,
        miniServices: miniServices,
        totalPricePaid: session.amount_total / 100,
      });

      await userExist.save();
      return res.redirect("/pp");
    } else {
      return res.status(400).json({
        success: false,
        title: req.query.serviceTitle,
        id: req.query.serviceID,
        miniServices,
        total: session.amount_total,
      });
    }
  } catch (error) {
    console.error("Error retrieving session:", error);
    return res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
});



// شراء الأسهم لمشروع استثماري
router.post("/investments", TokenMiddleware, async (req, res) => {
  try {
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const { projectId, numberOfShares } = req.body;

    // تحقق من إدخال البيانات الأساسية
    if (!projectId || !numberOfShares || numberOfShares <= 0) {
      return res.status(400).json({ message: "Invalid data. Please check your inputs." });
    }

    // البحث عن المشروع الاستثماري
    const investmentProject = await Investments.findById(projectId);
    if (!investmentProject) {
      return res.status(404).json({ message: "Project not found." });
    }

    // التحقق من عدد الأسهم المتبقية
    if (numberOfShares > investmentProject.numberofSharesRemaining) {
      return res.status(400).json({
        message: "Insufficient shares available.",
        availableShares: investmentProject.numberofSharesRemaining,
      });
    }

    // إنشاء بيانات الدفع لـ Stripe
    const priceData = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: investmentProject.title,
          },
          unit_amount: investmentProject.price * 100, // السعر لكل سهم بالدولار (السعر × 100 لتحويله إلى سنتات)
        },
        quantity: numberOfShares,
      },
    ];

    // إنشاء جلسة Stripe للدفع
    const session = await stripe.checkout.sessions.create({
      line_items: priceData,
      mode: "payment",
      success_url: `${process.env.BASE_URL}/payments/complete?session_id={CHECKOUT_SESSION_ID}&projectId=${projectId}&numberOfShares=${numberOfShares}&investor=${req.user.id}`,
      cancel_url: `${process.env.BASE_URL}/cancel`,
    });

    res.send(session.url);
  } catch (error) {
    console.error("Error during investment process:", error);
    res.status(500).json({ message: "An error occurred while processing your request." });
  }
});

// معالجة الدفع الناجح
router.get("/complete", async (req, res) => {
  try {
    const [session, lineItems] = await Promise.all([
      stripe.checkout.sessions.retrieve(req.query.session_id, {
        expand: ["payment_intent.payment_method"],
      }),
      stripe.checkout.sessions.listLineItems(req.query.session_id),
    ]);

    // التحقق من حالة الدفع
    if (session.payment_status === "paid") {
      const { projectId, numberOfShares, investor } = req.query;

      // البحث عن المشروع الاستثماري
      const investmentProject = await Investments.findById(projectId);
      if (!investmentProject) {
        return res.status(404).json({ message: "Project not found." });
      }

      // تحديث عدد الأسهم المتبقية
      investmentProject.numberofSharesRemaining -= Number(numberOfShares);

      // حفظ عملية الاستثمار
      const investmentRecord = new investmentProject({
        projectId,
        numberOfShares: Number(numberOfShares),
        price: investmentProject.price,
        buyBy: investor,
      });
      await investmentRecord.save();

      // حفظ التحديث في المشروع
      await investmentProject.save();

      return res.redirect("/success"); // يمكن تغييره حسب مسار النجاح
    } else {
      return res.status(400).json({ message: "Payment not successful." });
    }
  } catch (error) {
    console.error("Error completing payment:", error);
    res.status(500).json({ message: "An error occurred while processing your request." });
  }
});

// Define the route
router.get("/completeInt", async (req, res) => {
  try {
    res.render("PaymentDone");
  } catch (error) {
    console.error("Error retrieving session:", error);
    return res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
});
module.exports = router;
