import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: [true, "Email already exists"],
  },
  password: {
    type: String,
    required: true,
    length: [6, "Password must be at least 6 characters"],
  },
  balance: {
    type: Number,
    default: 0,
  },
  loanGiven: {
    type: Array,
    default: [],
    ref: "Loan",
  },
  loanPaid: {
    type: Array,
    default: [],
    ref: "Loan",
  },
  investment: {
    type: Array,
    default: [],
    ref: "Investment",
  },
  transactions: {
    type: Array,
    default: [],
    ref: "Transaction",
  },
});

export default mongoose.model("Admin", adminSchema);
