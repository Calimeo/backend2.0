// ESM version: Lit.js

import mongoose from "mongoose";

const litSchema = new mongoose.Schema({
  numero: { type: String, required: true },
  chambre: { type: mongoose.Schema.Types.ObjectId, ref: "Chambre", required: true },
  disponible: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Lit", litSchema);
