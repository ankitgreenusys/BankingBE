import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
  },
  transactionType: {
    type: String,
    required: true,
  },
  savingProfit: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

export default mongoose.model("Investment", investmentSchema);
