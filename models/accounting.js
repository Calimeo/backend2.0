import mongoose from "mongoose";

const accountingSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["income", "expense"],
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
}, {
  timestamps: true,
});

export default mongoose.model("Accounting", accountingSchema);
