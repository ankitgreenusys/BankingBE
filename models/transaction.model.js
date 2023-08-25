import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
  },
  transactionType: {
    type: String,
    enum: ["Deposit", "Withdraw", "LoanGiven", "LoanPaid", "Investment","LoanRepayment"],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  remark: {
    type: String,
  },
});

export default mongoose.model("Transaction", transactionSchema);
