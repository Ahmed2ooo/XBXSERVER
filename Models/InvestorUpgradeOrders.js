const mongoose = require("mongoose");

// Schema for Admins
const InvestorUpgradeOrdersSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true,
    required: true,
    ref: "Users",
  },
  nationalID: {
    type: String,
    unique: true,
    required: true,
  },
  verifiction: {
    type: Boolean,
    default: false,
    required: true,
  },
  verifyBy: {
    type: String,
  },
});

const InvestorUpgradeOrders = mongoose.model("InvestorUpgradeOrders",InvestorUpgradeOrdersSchema);

module.exports = InvestorUpgradeOrders;
