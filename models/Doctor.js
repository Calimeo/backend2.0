import mongoose from "mongoose";

const hospitalDoctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Le nom du médecin est requis."],
  },
  email: {
    type: String,
    required: [true, "L'email est requis."],
    unique: true,
  },
  phone: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  serviceId: {
    type: Number,
    required: [true, "L'ID du service est requis."],
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital", // ou "Hospital" si tu as un modèle distinct
    required: [true, "L'hôpital est requis."],
  },
}, { timestamps: true });

export default mongoose.model("HospitalDoctor", hospitalDoctorSchema);
