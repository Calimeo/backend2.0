import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ["Homme", "Femme", "Autre"], required: true },
  bloodGroup: { type: String, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], required: true },

  contact: {
    phone: { type: String },
    email: { type: String },
    address: { type: String },
  },

  medicalHistory: {
    allergies: { type: String },
    chronicDiseases: { type: String },
    medications: { type: String },
    surgeries: { type: String },
  },

  responsable: {
    name: { type: String, required: true },
    relation: { type: String },
    phone: { type: String },
  },

  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Le modèle Hôpital
    required: true,
  },
}, {
  timestamps: true,
});

patientSchema.index({ hospital: 1 });
patientSchema.index({ fullName: "text" });

export default mongoose.model("Patient", patientSchema);
