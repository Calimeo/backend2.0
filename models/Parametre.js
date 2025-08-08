// ESM version: Parametre.js

import mongoose from "mongoose";

const parametreSchema = new mongoose.Schema({
  cle: { type: String, required: true, unique: true },
  valeur: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

export default mongoose.model("Parametre", parametreSchema);
