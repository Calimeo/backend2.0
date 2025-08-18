// models/Nurse.js
import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  shiftType: {
    type: String,
    enum: ['morning', 'afternoon', 'night'],
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
});

const nurseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom est requis"],
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
    },
    phone: {
      type: String,
    },
    present: {
      type: Boolean,
      default: false,
    },
    shifts: [shiftSchema],
    totalHours: {
      type: Number,
      default: 0
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: [true, "il manque id du hopital"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Nurse", nurseSchema);