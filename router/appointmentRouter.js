import express from "express";
import {
  deleteAppointment,
  getAllAppointments,
  updateAppointment,
  getMyAppointments,
  deleteAppointmentByPatient,
  getDoctorAppointments,
  sendAppointment,
  updateAppointmentStatus,
  bookAppointment,
  
} from "../controller/appointmentController.js";
import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/auth.js";

const router = express.Router();

router.get("/getall",  getAllAppointments);
router.put("/update/:id" ,isAuthenticated, updateAppointment);
router.delete("/delete/:id", isAuthenticated, deleteAppointment);
router.get("/patient", isAuthenticated, getMyAppointments);
router.delete("/:id", isAuthenticated, deleteAppointmentByPatient);
router.get("/rdv", isAuthenticated, isAuthorized("Doctor"), getDoctorAppointments);
router.post("/send-appointment/:doctorId", isAuthenticated, sendAppointment);
router.put("/:appointmentId/status", isAuthenticated, updateAppointmentStatus);
router.post("/book", isAuthenticated, bookAppointment);


export default router;
