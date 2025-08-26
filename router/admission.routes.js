import express from "express";
import {
  admitPatient,
  dischargePatient,
  getActiveAdmissions,
  getAdmissionHistory,
  getAdmission,
  transferPatient
} from "../controller/admission.controller.js";
import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/auth.js";

const router = express.Router();

// Toutes les routes protégées
router.use(isAuthenticated);

// Routes pour l'admission
router.post("/",  admitPatient);
router.put("/:admissionId/discharge",  dischargePatient);
router.put("/:admissionId/transfer",  transferPatient);
router.get("/active",  getActiveAdmissions);
router.get("/history",  getAdmissionHistory);
router.get("/:admissionId",  getAdmission);

export default router;