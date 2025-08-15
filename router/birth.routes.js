// routes/birthRoutes.js
import express from "express";
import {
  addBirth,
  getBirths,
  updateBirth,
  deleteBirth
} from "../controller/birth.controller.js";
import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/auth.js";

const router = express.Router();

// Toutes les routes protégées pour le rôle "Hospital"
router.post("/", isAuthenticated, isAuthorized("Hospital"), addBirth);
router.get("/", isAuthenticated, isAuthorized("Hospital"), getBirths);
router.put("/:id", isAuthenticated, isAuthorized("Hospital"), updateBirth);
router.delete("/:id", isAuthenticated, isAuthorized("Hospital"), deleteBirth);

export default router;
