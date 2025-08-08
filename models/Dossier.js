// ESM version: Dossier.js

import mongoose from "mongoose";

const dossierSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  resume: { type: String },
  documents: [{ nom: String, url: String }]
}, { timestamps: true });

export default mongoose.model("Dossier", dossierSchema);
