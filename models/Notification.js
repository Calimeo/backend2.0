// ESM version: Notification.js

import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  destinataire: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: { type: String, required: true },
  lu: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);
