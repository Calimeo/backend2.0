import express from "express";
import {
  addBloodStock,
  getBloodStockByHospital,
  updateBloodStock,
  deleteBloodStock
} from "../controller/bloodStock.controller.js";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";

const router = express.Router();

// Toutes les routes nécessitent que l'hôpital soit connecté
router.post("/", isAuthenticated, addBloodStock);
router.get("/", isAuthenticated, getBloodStockByHospital);
router.put("/:id", isAuthenticated, updateBloodStock);
router.delete("/:id", isAuthenticated, deleteBloodStock);

export default router;
