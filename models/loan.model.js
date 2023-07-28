import mongoose from "mongoose";

const loanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  term: {
    type: Number,
    required: true,
  },
  interest: {
    type: String,
    emum: ["Compound Interest", "Simple Interest"],
  },
  interestRate: {
    type: Number,
    default: 10,
  },
  totalAmount: {
    type: Number,
  },
  repaymentterm: {
    type: Number,
    required: true,
  },
  repaymentAmount: {
    type: Number,
  },
  modeOfPayment: {
    type: String,
    enum: ["Bank Transfer", "Other", "Cash"],
    default: "Bank Transfer",
  },
  giventransactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
  },
  repaymenttransactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Declined", "Paid"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Loan", loanSchema);
