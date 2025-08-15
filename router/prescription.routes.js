// routes/prescriptionRoutes.js
import express from "express";
import { createPrescription, getPrescriptionsByHospital, getPrescriptionById } from "../controller/prescription.controller.js";
import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/auth.js";

const router = express.Router();

// Ajouter une prescription (Médecin uniquement)
router.post("/", isAuthenticated, isAuthorized("Doctor"), createPrescription);

// Voir toutes les prescriptions d'un hôpital
router.get("/", isAuthenticated, isAuthorized("Doctor", "Hospital", "Admin"), getPrescriptionsByHospital);

// Voir une prescription par ID
router.get("/:id", isAuthenticated, isAuthorized("Doctor", "Hospital", "Admin"), getPrescriptionById);

export default router;
