import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Le nom du service est requis"],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, "La description du service est requise"],
    trim: true
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "L'hôpital est requis"]
  },
  doctors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  price: {
    type: Number,
    required: [true, "Le prix du service est requis"],
    min: [0, "Le prix ne peut pas être négatif"]
  },
  duration: {
    type: Number, // en minutes
    required: [true, "La durée du service est requise"],
    min: [5, "La durée minimale est de 5 minutes"]
  },
  availability: {
    type: String,
    enum: ["available", "unavailable", "limited"],
    default: "available"
  },
  category: {
    type: String,
    required: [true, "La catégorie du service est requise"],
    enum: [
      "consultation",
      "urgence",
      "chirurgie",
      "radiologie",
      "laboratoire",
      "pharmacie",
      "hospitalisation",
      "autre"
    ]
  },
  requirements: [{
    type: String,
    trim: true
  }],
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
serviceSchema.index({ name: 1, hospital: 1 }, { unique: true });
serviceSchema.index({ category: 1 });
serviceSchema.index({ hospital: 1, availability: 1 });

// Méthode pour obtenir les services disponibles d'un hôpital
serviceSchema.statics.getHospitalServices = function(hospitalId) {
  return this.find({ 
    hospital: hospitalId,
    availability: { $in: ["available", "limited"] }
  }).populate("doctors", "firstName lastName specialty")
    .populate("hospital", "name address phone")
    .sort({ name: 1 });
};

// Méthode pour obtenir les services par catégorie
serviceSchema.statics.getServicesByCategory = function(hospitalId, category) {
  return this.find({ 
    hospital: hospitalId,
    category: category,
    availability: { $in: ["available", "limited"] }
  }).populate("doctors", "firstName lastName specialty")
    .sort({ name: 1 });
};

export default mongoose.model("Service", serviceSchema);