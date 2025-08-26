// models/Laboratory.js
import mongoose from "mongoose";

const laboratorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom du laboratoire est requis"],
    },
    department: {
      type: String,
      required: [true, "Le département est requis"],
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // hôpital
      required: [true, "L'hôpital est requis"],
    },
    patients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient", // 🔹 Référence directe au modèle Patient
      },
    ],
    tests: [
      {
        testName: { type: String, required: true },
        result: { type: String },
        date: { type: Date, default: Date.now },
        patient: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Patient",
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Laboratory", laboratorySchema);
