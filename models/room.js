import mongoose from "mongoose";

const bedSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
  },
  available: {
    type: Boolean,
    default: true,
  },
  hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital", // ou "Hospital" si tu as un modèle distinct
      required: [true, "L'hôpital est requis."],
    },
});


const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  beds: [bedSchema],
});

export default mongoose.model("Room", roomSchema);
