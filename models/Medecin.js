// ESM version: Medecin.js

import mongoose from "mongoose";

const medecinSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  specialite: { type: String },
  disponibilites: [{ jour: String, heures: [String] }]
}, { timestamps: true });

export default mongoose.model("Medecin", medecinSchema);
