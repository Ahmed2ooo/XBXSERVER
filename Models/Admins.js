const mongoose = require("mongoose");

// Schema for Admins
const AdminSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true,
    required: true,
  },
  role: {
    type: String,
    default: "admin",

    required: true,
  },
  password: { type: String, required: true },
});

const Admin = mongoose.model("Admin", AdminSchema);

module.exports = Admin;
