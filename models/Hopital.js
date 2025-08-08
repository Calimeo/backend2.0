// ESM version: Hopital.js

import mongoose from "mongoose";

const hopitalSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  adresse: { type: String },
  email: { type: String },
  telephone: { type: String },
  directeur: { type: String },
  password: {
    type: String,
    required: [true, "Password Is Required!"],
    minLength: [8, "Password Must Contain At Least 8 Characters!"],
    select: false
  },
}, { timestamps: true });

export default mongoose.model("Hopital", hopitalSchema);
