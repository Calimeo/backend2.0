// ESM version: Activite.js

import mongoose from "mongoose";

const activiteSchema = new mongoose.Schema({
  utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: { type: String },
  date: { type: Date, default: Date.now },
  details: { type: String }
}, { timestamps: true });

export default mongoose.model("Activite", activiteSchema);
