import express from "express";
import {
  addNewAdmin,
  addNewDoctor,
  addNewHospital,
  getAllDoctors,
  getUserDetails,
  login,
  getAllPatients,
  getAllHospitals,
  logoutAdmin,
  logoutPatient,
  logoutDoctor,
  logoutHospital,
  patientRegister,
  searchDoctors,
  followDoctor,
  unfollowDoctor,
  getFollowedDoctors,
  getDoctorById,
} from "../controller/userController.js";

import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/auth.js";

const router = express.Router();

// Auth & Register
router.post("/patient/register", patientRegister);
router.post("/login", login);

// Add users (with role protection)
router.post("/admin/addnew", isAuthenticated, isAuthorized("Admin"), addNewAdmin);
router.post("/doctor/addnew", isAuthenticated, isAuthorized("Admin", "Hospital"), addNewDoctor);
router.post("/register/hospital", addNewHospital);

// Get user info (protected)
router.get("/patient/me", isAuthenticated, isAuthorized("Patient"), getUserDetails);
router.get("/admin/me", isAuthenticated, isAuthorized("Admin"), getUserDetails);
router.get("/hospital/me", isAuthenticated, isAuthorized("Hospital"), getUserDetails);
router.get("/doctor/me", isAuthenticated, isAuthorized("Doctor"), getUserDetails);
router.get("/doctor/:id", getDoctorById);

// Logout
router.get("/patient/logout", isAuthenticated, isAuthorized("Patient"), logoutPatient);
router.get("/admin/logout", isAuthenticated, isAuthorized("Admin"), logoutAdmin);
router.get("/doctor/logout", isAuthenticated, isAuthorized("Doctor"), logoutDoctor);
router.get("/hospital/logout",  logoutHospital);

// Public or Admin-only
router.get("/doctors", isAuthenticated, getAllDoctors);
router.get("/patient", isAuthenticated, isAuthorized("Admin", "Hospital"), getAllPatients);
router.get("/hospital", getAllHospitals);

//
router.get("/search", searchDoctors);
router.put("/follow/:doctorId",isAuthenticated, isAuthorized("Patient"),  followDoctor);
router.put("/unfollow/:doctorId",isAuthenticated, isAuthorized("Patient"),  unfollowDoctor);
router.get("/following",isAuthenticated, isAuthorized("Patient"),  getFollowedDoctors);


export default router;
