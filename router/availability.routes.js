import express from "express";
import { addAvailability,
        getMyAvailabilities,
        getDoctorAvailabilities
     } from "../controller/availability.controller.js";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";

const router = express.Router();

router.post("/add", isAuthenticated, addAvailability);
router.get("/my", isAuthenticated, getMyAvailabilities);
router.get("/:doctorId", getDoctorAvailabilities);

export default router;
