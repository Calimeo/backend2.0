import express from "express";
import {
  addInventory,
  getInventory,
  updateInventory,
  deleteInventory,
  getInventoryStats,
  getLowStockItems,
  updateStockQuantity
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
router.get('/stats', getInventoryStats);
router.get('/low-stock', getLowStockItems);
router.put('/:id/stock', updateStockQuantity);

export default router;
