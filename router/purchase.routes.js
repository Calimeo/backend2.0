import express from "express";
import {
  getAvailableProducts,
  buyProduct,
  getMyPurchases,
} from "../controller/Purchase.controller.js";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";

const router = express.Router();

// Voir les produits disponibles pour les patients
router.get("/products/p", isAuthenticated, isAuthorized("Patient"), getAvailableProducts);

// Acheter un produit
router.post("/buy", isAuthenticated, isAuthorized("Patient"), buyProduct);

// Voir l’historique des achats
router.get("/my-purchases", isAuthenticated, isAuthorized("Patient"), getMyPurchases);

export default router;
