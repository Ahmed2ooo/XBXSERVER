const mongoose = require("mongoose");

// Schema for Admins
const SuperAdminSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true,
    required: true,
  },
  role: {
    type: String,
    default: "superAdmin",

    required: true,
  },
  password: { type: String, required: true },
});

const SuperAdmin = mongoose.model("SuperAdmin", SuperAdminSchema);

module.exports = SuperAdmin;
