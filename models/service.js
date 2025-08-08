import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Le nom du service est requis"],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: "",
  },
}, { timestamps: true });

export default mongoose.model("Service", serviceSchema);
