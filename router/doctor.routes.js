import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";
import { addDoctorToHospital,getDoctorsByHospital } from "../controller/doctor.controller.js";

const router = express.Router();

// Hôpital ajoute un médecin
router.post("/add",isAuthenticated, isAuthorized("Hospital"), addDoctorToHospital);
router.get("/message/get", isAuthenticated, isAuthorized("Hospital"), getDoctorsByHospital);

export default router;
