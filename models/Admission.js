import mongoose from "mongoose";

const admissionSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    admissionDate: {
      type: Date,
      required: true,
    },
    dischargeDate: {
      type: Date,
      default: null,
    },
    room: {
      type: String,
      required: true,
    },
    bed: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["admitted", "discharged"],
      default: "admitted",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Admission", admissionSchema);
