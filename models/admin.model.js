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
});

export default mongoose.model("Admin", adminSchema);
