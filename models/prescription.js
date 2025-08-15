// models/Prescription.js
import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Le médecin est un utilisateur
      required: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital", // Hôpital du médecin
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient", // Patient enregistré dans l’hôpital
      required: true,
    },
    medications: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true }, // Exemple: "500mg"
        frequency: { type: String, required: true }, // Exemple: "2 fois/jour"
        duration: { type: String, required: true }, // Exemple: "7 jours"
        instructions: { type: String }, // Instructions spéciales
      },
    ],
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Prescription", prescriptionSchema);
