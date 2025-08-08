import express from "express";
import {
  addInventory,
  getInventory,
  updateInventory,
  deleteInventory,
} from "../controller/inventory.controller.js";
import { isAuthenticated ,isAuthorized,} from "../middlewares/auth.js";

const router = express.Router();

// 📦 Ajouter un item (avec image possible)
router.post("/add", isAuthenticated, isAuthorized("Hospital"), addInventory);

// 📋 Obtenir tous les items
router.get("/", isAuthenticated, isAuthorized("Hospital"), getInventory);

// ✏️ Mettre à jour un item
router.put("/:id", isAuthenticated, isAuthorized("Hospital"), updateInventory);

// ❌ Supprimer un item
router.delete("/:id", isAuthenticated, isAuthorized("Hospital"), deleteInventory);

export default router;
