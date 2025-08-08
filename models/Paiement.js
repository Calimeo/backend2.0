// ESM version: Paiement.js

import mongoose from "mongoose";

const paiementSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  montant: { type: Number, required: true },
  methode: { type: String, enum: ["espèces", "carte", "virement"], default: "espèces" },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Paiement", paiementSchema);
