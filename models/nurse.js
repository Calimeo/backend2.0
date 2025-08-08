// models/Nurse.js
import mongoose from "mongoose";

const nurseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom est requis"],
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
    },
    phone: {
      type: String,
    },
    present: {
      type: Boolean,
      default: false, // par défaut absente
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Nurse", nurseSchema);
