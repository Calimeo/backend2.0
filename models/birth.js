// models/birth.js
import mongoose from "mongoose";

const birthSchema = new mongoose.Schema(
  {
    babyName: {
      type: String,
      required: true,
      trim: true
    },
    gender: {
      type: String,
      enum: ["Garçon", "Fille", "Other"],
      required: true
    },
    birthDate: {
      type: Date,
      required: true
    },
    motherName: {
      type: String,
      required: true,
      trim: true
    },
    fatherName: {
      type: String,
      trim: true
    },
    weight: {
      type: Number, // en kg
      required: true
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true
    },
    notes: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Birth", birthSchema);
