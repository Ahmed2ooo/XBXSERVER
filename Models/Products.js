const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  type: {
    default: "Product",
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
  price: {
    type: Number,
    required: true,
  },
  shippingCost: {
    type: Number,
    required: true,
  },
  numberOfPurchases: {
    default: 0,
    type: Number,
    required: true,
  },
  availability: {
    type: Boolean,
    default: true,
    required: true,
  },
  instructions: {
    type: [String],
    required: true,
  },
  customFields: {
    type: Map, // حقل لدعم الحقول الديناميكية
    of: String, // القيم ستكون نصوص (يمكنك تغييره لدعم أنواع مختلفة)
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

const Products = mongoose.model("Products", ProductSchema);

module.exports = Products;
