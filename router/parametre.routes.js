// ESM version: parametre.routes.js

import express from 'express';
import {
  getParametres,
  setParametre
} from '../controller/parametre.controller.js';

const router = express.Router();

// Lire les paramètres
router.get('/', getParametres);

// Mettre à jour les paramètres
router.put('/', setParametre);

export default router;
