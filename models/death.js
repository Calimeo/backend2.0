import mongoose from "mongoose";

const deathSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: false // si tu veux lier avec ton modèle Patient
  },
  causeOfDeath: {
    type: String,
    required: true
  },
  dateOfDeath: {
    type: Date,
    required: true
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
  },
  responsiblePerson: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ""
  }
}, { timestamps: true });

export default mongoose.model("Death", deathSchema);
