import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const bedSchema = new mongoose.Schema({
  number: {
    type: String,
    required: [true, "Le numéro du lit est requis"],
    trim: true
  },
  status: {
    type: String,
    enum: ["available", "occupied", "maintenance", "cleaning"],
    default: "available"
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const roomSchema = new mongoose.Schema({
  number: {
    type: String,
    required: [true, "Le numéro de chambre est requis"],
    trim: true,
    unique: true
  },
  name: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ["standard", "private", "icu", "emergency", "maternity", "pediatric"],
    default: "standard"
  },
  capacity: {
    type: Number,
    required: [true, "La capacité de la chambre est requise"],
    min: [1, "La capacité doit être au moins de 1"]
  },
  beds: [bedSchema],
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "L'hôpital est requis"]
  },
  status: {
    type: String,
    enum: ["available", "full", "maintenance", "closed"],
    default: "available"
  },
  floor: {
    type: String,
    trim: true
  },
  wing: {
    type: String,
    trim: true
  },
  features: [{
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

// Index pour éviter les doublons de numéro de chambre par hôpital
roomSchema.index({ number: 1, hospital: 1 }, { unique: true });

// Index pour les recherches par type et statut
roomSchema.index({ type: 1, status: 1 });
roomSchema.index({ hospital: 1, status: 1 });

// Méthode pour vérifier si la chambre est pleine
roomSchema.methods.isFull = function() {
  const occupiedBeds = this.beds.filter(bed => bed.status === "occupied").length;
  return occupiedBeds >= this.capacity;
};


// Dans models/Room.js
roomSchema.methods.updateRoomStatus = function() {
  const occupiedBeds = this.beds.filter(bed => bed.status === "occupied").length;
  const totalBeds = this.beds.length;
  
  if (occupiedBeds === 0) {
    this.status = "available";
  } else if (occupiedBeds >= this.capacity) {
    this.status = "full";
  } else if (occupiedBeds > 0 && occupiedBeds < this.capacity) {
    this.status = "available"; // ou "partially_occupied" si vous voulez un statut spécifique
  }
  
  return this.save();
};

// Méthode pour obtenir les lits disponibles
roomSchema.methods.getAvailableBeds = function() {
  return this.beds.filter(bed => bed.status === "available");
};

// Appliquer le plugin de pagination
roomSchema.plugin(mongoosePaginate);

export default mongoose.model("Room", roomSchema);