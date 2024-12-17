const mongoose = require("mongoose");

const MiniServiceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  overview: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const ServiceSchema = new mongoose.Schema({
  type: {
    default: "Service",
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  overView: {
    type: String,
    required: true,
  },
  cover: {
    type: String,
    required: true,
  },
  gallery: {
    type: [String],
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  miniServices: [MiniServiceSchema],
  numberOfPurchases: {
    default: 0,
    type: Number,
    required: true,
  },
  instructions: {
    type: [String],
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  uploadedBy: {
    type: String,
    ref: "Admin",
    required: true,
  },
});

const Services = mongoose.model("Services", ServiceSchema);

module.exports = Services;
