import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
    required: true,
    unique: [true, "Mobile number already exists"],
  },
  email: {
    type: String,
    required: true,
    unique: [true, "Email already exists"],
  },
  password: {
    type: String,
    length: [6, "Password must be at least 6 characters"],
  },
  gender: {
    type: String,
  },
  dob: {
    type: Date,
  },
  joiningDate: {
    type: Date,
    default: Date.now,
  },
  otp: {
    type: Number,
    required: true,
  },
  otpExpires: {
    type: Date,
    required: true,
  },
  image: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  savingprofit: {
    type: String,
    default: 0,
  },
  totalDeposit: {
    type: Number,
    default: 0,
  },
  balance: {
    type: Number,
    default: 0,
  },
  totalWithdraw: {
    type: Number,
    default: 0,
  },
  totalProfit: {
    type: Number,
    default: 0,
  },
  transactions: {
    type: Array,
    default: [],
    ref: "Transaction",
  },
  loan: {
    type: Array,
    default: [],
    ref: "Loan",
  },
  investment: {
    type: Array,
    default: [],
    ref: "Investment",
  },
});

export default mongoose.model("User", userSchema);
