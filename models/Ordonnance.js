// ESM version: Ordonnance.js

import mongoose from "mongoose";

const ordonnanceSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  medecin: { type: mongoose.Schema.Types.ObjectId, ref: "Medecin", required: true },
  prescriptions: [{ medicament: String, posologie: String }],
  examensDemandes: [String]
}, { timestamps: true });

export default mongoose.model("Ordonnance", ordonnanceSchema);
