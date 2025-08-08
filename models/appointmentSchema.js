import mongoose from "mongoose";
import { Mongoose } from "mongoose";
import validator from "validator";

const appointmentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [false, "First Name Is Required!"],
    minLength: [3, "First Name Must Contain At Least 3 Characters!"],
  },
  lastName: {
    type: String,
    required: [false, "Last Name Is Required!"],
    minLength: [3, "Last Name Must Contain At Least 3 Characters!"],
  },
  email: {
    type: String,
    required: [false, "Email Is Required!"],
    validate: [validator.isEmail, "Provide A Valid Email!"],
  },
  phone: {
    type: String,
    required: [false, "Phone Is Required!"],
    minLength: [8, "Phone Number Must Contain Exact 11 Digits!"],
    maxLength: [11, "Phone Number Must Contain Exact 11 Digits!"],
  },
  nic: {
    type: String,
    required: [false, "NIC Is Required!"],
    minLength: [13, "NIC Must Contain Only 13 Digits!"],
    maxLength: [13, "NIC Must Contain Only 13 Digits!"],
  },
  dob: {
    type: Date,
    required: [false, "DOB Is Required!"],
  },
  gender: {
    type: String,
    required: [false, "Gender Is Required!"],
    enum: ["Male", "Female"],
  },
  appointment_date: {
    type: String,
    required: [false, "Appointment Date Is Required!"],
  },
  department: {
    type: String,
    required: [false, "Department Name Is Required!"],
  },
  doctor: {
    firstName: {
      type: String,
      required: [false, "Doctor Name Is Required!"],
    },
    lastName: {
      type: String,
      required: [false, "Doctor Name Is Required!"],
    },
  },
  hasVisited: {
    type: Boolean,
    default: false,
  },
  address: {
    type: String,
    required: [false, "Address Is Required!"],
  },
  detail: { 
    type: String,
     required: false 
  },
  doctorId: {
    type: mongoose.Schema.ObjectId,
    required: [false, "Doctor Id Is Invalid!"],
  },
  patientId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [false, "Patient Id Is Required!"],
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  date: {
    type: Date,
    required: false,
  },
  reason: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected"],
    default: "Pending",
  },
});

export const Appointment = mongoose.model("Appointment", appointmentSchema);
