import express from "express";
import {
  createService,
  getHospitalServices,
  getAllServices,
  getService,
  updateService,
  deleteService,
  addDoctorToService,
  removeDoctorFromService,
  getServiceStats
} from "../controller/service.controller.js";
import { isAuthenticated ,isAuthorized,} from "../middlewares/auth.js";

const router = express.Router();

// Routes publiques
router.get("/", getAllServices); // Pour les patients
router.get("/:serviceId", getService); // Pour tout le monde

// Routes protégées
router.use(isAuthenticated);

// Routes pour les hôpitaux
router.post("/",  createService);
router.get("/hospital/:hospitalId", getHospitalServices);
router.put("/:serviceId",  updateService);
router.delete("/:serviceId",  deleteService);
router.post("/doctors/add",  addDoctorToService);
router.post("/doctors/remove",  removeDoctorFromService);
router.get("/stats/analytics",  getServiceStats);

export default router;