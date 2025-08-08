// ESM version: statistiques.routes.js

import express from 'express';
import {
  getStatistiques
} from '../controller/statistiques.controller.js';

const router = express.Router();

// Statistiques tableau de bord
router.get('/dashboard', getStatistiques);

export default router;
