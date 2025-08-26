import mongoose from "mongoose";

const admissionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Le patient est requis"]
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: [true, "La chambre est requise"]
  },
  bed: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Le lit est requis"]
  },
  admissionDate: {
    type: Date,
    default: Date.now,
    required: [true, "La date d'admission est requise"]
  },
  dischargeDate: {
    type: Date,
    default: null
  },
  reason: {
    type: String,
    trim: true,
    required: [true, "La raison de l'admission est requise"]
  },
  diagnosis: {
    type: String,
    trim: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Le médecin est requis"]
  },
  status: {
    type: String,
    enum: ["admitted", "discharged", "transferred"],
    default: "admitted"
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: true
});

// Index pour les recherches
admissionSchema.index({ patient: 1, status: 1 });
admissionSchema.index({ room: 1, bed: 1 });
admissionSchema.index({ admissionDate: 1 });

// Méthode pour obtenir les admissions actives
admissionSchema.statics.getActiveAdmissions = function() {
  return this.find({ status: "admitted" })
    .populate("patient", "firstName lastName email phone")
    .populate("room", "number name")
    .populate("doctor", "firstName lastName");
};

export default mongoose.model("Admission", admissionSchema);