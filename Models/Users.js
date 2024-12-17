const mongoose = require("mongoose");

// MiniService Schema
const MiniServiceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

// UserServices Schema
const UserServicesSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  serviceTitle: {
    type: String,
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  miniServices: [MiniServiceSchema], // Array of mini services
  totalPricePaid: {
    type: Number,
    required: true,
  },
  isPaid: {
    type: Boolean,
    default: true, // Assuming service is paid by default
  },
  isDelivered: {
    type: Boolean,
    default: false, // Assuming service is not delivered by default
  },
});

// Schema for a single Order Item
const OrderItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
});

// Schema for a single Order
const OrderSchema = new mongoose.Schema({
  items: [OrderItemSchema],
  totalOrderPrice: {
    type: Number,
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Cancelled"],
    default: "Pending",
  },
});

const InvestmentProjectSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Investment",
    required: true,
  },
  numberOfShares: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    default: 0,
  },
  investmentDate: {
    type: Date,
    default: Date.now,
  },
  buyBy:{
    type: String,
    ref: "investor",
    required: true,
  }
});

// Schema for Users
const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true,
    required: true,
  },
  role: {
    type: String,
    default: "user",
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    value: {
      type: String,
      unique: true,
      required: true,
    },
    verifctionCode: {
      type: Number,
      required: true,
    },
    confirmation: {
      type: Boolean,
      default: false,
    },
  },
  nationalId: {
    type: String,
    default: null,
  },
  nationalIdConfirmation: {
    type: Boolean,
    default: false,
  },
  userService: [UserServicesSchema],
  ordersHistory: [OrderSchema],
  investments: [InvestmentProjectSchema],

  paymentData: {
    token: {
      type: String,
    },
    name: {
      type: String,
    },
    last4Numbers: {
      type: String,
    },
  },

  balance: {
    type: Number,
    default: 0,
  },
  withdrawableBalance: {
    type: Number,
    default: 0,
  },
});

const Users = mongoose.model("Users", UserSchema);

module.exports = Users;
