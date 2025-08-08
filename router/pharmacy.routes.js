import express from "express";
import {
  addProduct,
  getHospitalProducts,
} from "../controller/pharmacy.controller.js";
import { isAuthenticated, isAuthorized
 } from "../middlewares/auth.js";

const router = express.Router();

// Hôpital ajoute produit
router.post("/product/add", isAuthenticated, isAuthorized("Hospital"), addProduct);

// Voir les produits de l’hôpital connecté
router.get("/product/my", isAuthenticated, isAuthorized("Hospital"), getHospitalProducts);

export default router;
