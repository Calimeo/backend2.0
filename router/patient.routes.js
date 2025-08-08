import express from "express";
import {
  createPatient,
  getPatientsByHospital,
  updatePatient,
  deletePatient,
} from "../controller/patient.controller.js";
import {
  isAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();

router
  .route("/")
  .post(isAuthenticated, createPatient)           // POST /api/v1/patients
  .get(isAuthenticated, getPatientsByHospital);   // GET  /api/v1/patients

router
  .route("/:id")
  .put(isAuthenticated, updatePatient)            // PUT /api/v1/patients/:id
  .delete(isAuthenticated, deletePatient);        // DELETE /api/v1/patients/:id

export default router;
