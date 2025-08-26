import express from "express";
import { addAvailability,
        getMyAvailabilities,
        getDoctorAvailabilities,
        bookAvailability,
        getPatientBookings,
     } from "../controller/availability.controller.js";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";

const router = express.Router();

router.post("/add", isAuthenticated, addAvailability);
router.get("/my", isAuthenticated, getMyAvailabilities);
router.get("/:doctorId", getDoctorAvailabilities);
router.post("/book", isAuthenticated, bookAvailability);
router.get("/my/bookings",isAuthenticated, getPatientBookings);

export default router;
