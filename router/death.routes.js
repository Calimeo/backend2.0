import express from "express";
import { addDeath, getDeathsByHospital, deleteDeath } from "../controller/death.controller.js";
import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/auth.js";
const router = express.Router();

// Ajouter un décès
router.post("/", isAuthenticated, addDeath);

// Lister les décès d'un hôpital
router.get("/hospital", isAuthenticated, getDeathsByHospital);

// Supprimer un décès
router.delete("/:id",isAuthenticated, deleteDeath);

export default router;
