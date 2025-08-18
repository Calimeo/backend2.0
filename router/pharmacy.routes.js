import express from "express";
import {
  addProduct,
   listProducts,
  deleteProduct,
} from "../controller/pharmacy.controller.js";
import { isAuthenticated, isAuthorized
 } from "../middlewares/auth.js";
 import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Hôpital ajoute produit
router.post("/product/add", isAuthenticated, isAuthorized("Hospital"), upload.single('image'), addProduct);

// Voir les produits de l’hôpital connecté
router.get("/product/my", isAuthenticated, isAuthorized("Hospital"), listProducts);
router.delete('/products/:id', isAuthenticated, isAuthorized("Hospital"), deleteProduct);

export default router;
