// ESM version: Role.js

import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  nom: { type: String, required: true, unique: true },
  permissions: [{ type: String }]
}, { timestamps: true });

export default mongoose.model("Role", roleSchema);
