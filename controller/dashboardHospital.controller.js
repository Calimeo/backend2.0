// controllers/hospitalDashboardController.js
import Doctor from "../models/doctor.js";
import Patient from "../models/Patient.js";
import { Appointment } from "../models/appointmentSchema.js";
import Nurse from "../models/nurse.js";
import { Inventory } from "../models/inventory.js";
import Birth from "../models/birth.js";
import Accounting from "../models/accounting.js";
import BloodStock from "../models/bloodStock.js";
import Death from "../models/death.js";



export const getHospitalDashboard = async (req, res) => {
  try {
    const hospitalId = req.user._id; // ID de l'hôpital connecté

    const [
      doctors,
      patients,
      appointments,
      nurses,
      inventory,
      accounting,
      bloodStock,
      deaths,
      births,
    ] = await Promise.all([
      Doctor.find({ hospitalId }),
      Patient.find({ hospitalId }),
      Appointment.find({ hospitalId }),
      Nurse.find({ hospitalId }),
      Inventory.find({ hospitalId }),
      Accounting.find({ hospitalId }),
      BloodStock.find({ hospitalId }),
      Death.find({ hospitalId }),
      Birth.find({ hospitalId }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDoctors: doctors.length,
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        totalNurses: nurses.length,
        totalInventoryItems: inventory.length,
        totalAccountingRecords: accounting.length,
        totalBloodStockEntries: bloodStock.length,
        totalDeaths: deaths.length,
        totalBirths: births.length,
        doctors,
        patients,
        appointments,
        nurses,
        inventory,
        accounting,
        bloodStock,
        deaths,
        births,
      }
    });

  } catch (error) {
    console.error("Erreur getHospitalDashboard:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
      error: error.message
    });
  }
};
