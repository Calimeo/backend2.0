import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";
import { addDoctorToHospital,getDoctorsByHospital,updateDoctorStatus } from "../controller/doctor.controller.js";

const router = express.Router();

// Hôpital ajoute un médecin
router.post("/add",isAuthenticated, isAuthorized("Hospital"), addDoctorToHospital);
router.get("/get", isAuthenticated, getDoctorsByHospital);
router.patch('/status/:doctorId', isAuthenticated, isAuthorized("Hospital"), updateDoctorStatus);

export default router;
