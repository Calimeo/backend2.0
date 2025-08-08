import mongoose from "mongoose";

const statistiqueSchema = new mongoose.Schema({
  type: { type: String, required: true }, // exemple : "patients", "rendez-vous"
  valeur: { type: Number, required: true },
  periode: { type: String }, // exemple : "jour", "mois", "année"
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Statistique", statistiqueSchema);
