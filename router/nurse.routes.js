// routes/nurseRoutes.js
import express from "express";
import {
  addNurse,
  getAllNurses,
  updateNurse,
  deleteNurse,
  togglePresence,
} from "../controller/nurse.controller.js";

const router = express.Router();

// Créer une infirmière
router.post("/", addNurse);

// Voir toutes les infirmières
router.get("/", getAllNurses);

// Modifier une infirmière
router.put("/:id", updateNurse);

// Supprimer une infirmière
router.delete("/:id", deleteNurse);

// Marquer présence / absence
router.patch("/:id/presence", togglePresence);

export default router;
