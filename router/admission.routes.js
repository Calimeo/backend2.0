import express from "express";
import {
  addAdmission,
  getAllAdmissions,
  dischargePatient,
} from "../controller/admission.controller.js";

const router = express.Router();

router.post("/", addAdmission); // Ajouter un patient
router.get("/", getAllAdmissions); // Récupérer tous les patients
router.put("/:id/discharge", dischargePatient); // Marquer comme sorti

export default router;
