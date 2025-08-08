// ESM version: Emploi.js

import mongoose from "mongoose";

const emploiSchema = new mongoose.Schema({
  medecin: { type: mongoose.Schema.Types.ObjectId, ref: "Medecin", required: true },
  jour: { type: String, required: true }, // Lundi, Mardi...
  heureDebut: { type: String },
  heureFin: { type: String }
}, { timestamps: true });

export default mongoose.model("Emploi", emploiSchema);
