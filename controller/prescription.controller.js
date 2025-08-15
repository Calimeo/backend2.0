// controllers/prescriptionController.js
import Prescription from "../models/prescription.js";
import { User } from "../models/userSchema.js";
import Patient from "../models/Patient.js";

export const createPrescription = async (req, res) => {
  try {
    const { patientId, medications, notes } = req.body;

    // Vérifier que le médecin existe
    const doctor = await User.findById(req.user._id); // L'ID du médecin est pris depuis le token
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Médecin introuvable" });
    }

    // Vérifier que le patient existe
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient introuvable" });
    }

    // Vérifier que le patient appartient au même hôpital que le médecin
    if (doctor.hospital.toString() !== patient.hospital.toString()) {
      return res.status(403).json({ success: false, message: "Ce patient n'appartient pas à votre hôpital" });
    }

    const prescription = await Prescription.create({
      doctor: doctor._id,
      hospital: doctor.hospital,
      patient: patientId,
      medications,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Prescription enregistrée avec succès",
      data: prescription,
    });
  } catch (error) {
    console.error("Erreur createPrescription:", error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur", error: error.message });
  }
};

export const getPrescriptionsByHospital = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ hospital: req.user._hospital })
      .populate("doctor", "name email")
      .populate("patient", "fullName age")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: prescriptions });
  } catch (error) {
    console.error("Erreur getPrescriptionsByHospital:", error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur", error: error.message });
  }
};

export const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate("doctor", "name email")
      .populate("patient", "fullName age");

    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription introuvable" });
    }

    res.status(200).json({ success: true, data: prescription });
  } catch (error) {
    console.error("Erreur getPrescriptionById:", error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur", error: error.message });
  }
};
