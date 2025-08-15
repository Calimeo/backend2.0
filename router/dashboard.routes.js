// routes/hospitalDashboardRoutes.js
import express from "express";
import { getHospitalDashboard } from "../controller/dashboardHospital.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", isAuthenticated, getHospitalDashboard);

export default router;
