const mongoose = require("mongoose");

const InvestmentSchema = new mongoose.Schema({
  type: {
    default: "Investment",
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description:{
    type:String,
    required:true,
    maxlength:[400,"should not long for 400 character"]
  },
  cover: {
    type: String,
    required: true,
  },
  gallery: {
    type: [String],
    required: true,
  },
  numberOfShares: {
    type: Number,
    required: true,
  },
  highNumberOfShares: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        return value <= this.numberOfShares;
      },
      message: "highNumberOfShares يجب أن يكون أقل من أو يساوي numberOfShares.",
    },
  },
  lowNumberOfShares: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        return value < this.highNumberOfShares; 
      },
      message: "highNumberOfShares يجب أن يكون أقل من  highNumberOfShares.",
    },
  },
  priceOfShersAvailableForInvesment:{
    type: Number,
    default: 0,
    required: true,
  },
  price:{
    type: Number,
    default: 0,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  numberofSharesRemaining:{
    type: Number, 
    default: 0,
    required: true,
  },
  
  totalProjectSize: {
    type: Number, // حجم المشروع
    required: true,
  },
  sharesPercentage: {
    type: Number, // النسبة المئوية للأسهم المطروحة من حجم المشروع
    default: 0,
    required: true,
  },
  investmentDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  numberOfSharesPurchases:{
    type: Number, 
    default: 0,
    required: true,
    validate: {
      validator: function (value) {
        return value <= this.numberOfShares; 
      },
      message: "numberOfSharesPurchases يجب أن يكون أقل من أو يساوي numberOfShares.",
    },
  },
  createdBy: {
    type: String,
    ref: "Admin",
    required: true,
  },
  
});

InvestmentSchema.pre("save", function (next) {
  if (this.numberOfShares > 0 && this.totalProjectSize > 0) {
    this.sharesPercentage = (this.numberOfShares*this.price / this.totalProjectSize) * 100;
  } else {
    this.sharesPercentage = 0;
  }
  next();
});


InvestmentSchema.pre("save", function (next) {
  if (this.numberOfShares > 0 && this.numberOfSharesPurchases >= 0) {
    this.numberofSharesRemaining = this.numberOfShares - this.numberOfSharesPurchases;
  } else {
    this.numberofSharesRemaining = this.numberOfShares; // جميع الأسهم ما زالت متاحة
  }
  next();
});
const Investments = mongoose.model("Investments", InvestmentSchema);

module.exports = Investments;
