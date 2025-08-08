// routes/appointmentRoutes.js
import express from "express";
import {
  createAppointment,
  getMyAppointments,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointmentController.js";
import { isPatientAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();


// 📋 Voir tous les rendez-vous du patient connecté
router.get("/me", isPatientAuthenticated, getMyAppointments);

// ✏️ Modifier un rendez-vous (si non approuvé)
router.put("/:id", isPatientAuthenticated, updateAppointment);

// ❌ Supprimer un rendez-vous (si non approuvé)
router.delete("/:id", isPatientAuthenticated, deleteAppointment);

export default router;
