import express from "express";
import {
  createService,
  getAllServices,
  updateService,
  deleteService,
} from "../controller/service.controller.js";

const router = express.Router();

router.post("/", createService);         // Ajouter un service
router.get("/", getAllServices);         // Tous les services
router.put("/:id", updateService);       // Modifier un service
router.delete("/:id", deleteService);    // Supprimer un service

export default router;
