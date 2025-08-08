// ESM version: hopital.routes.js

import express from 'express';
import {
  createHopital,
  getHopitaux,
  // getHopitalById,
  // updateHopital,
  // deleteHopital
} from '../controller/hopital.controller.js';

const router = express.Router();

// Créer un hôpital
router.post('/', createHopital);

// Obtenir tous les hôpitaux
router.get('/', getHopitaux);

// // Obtenir un hôpital par ID
// router.get('/:id', getHopitalById);

// // Modifier un hôpital
// router.put('/:id', updateHopital);

// // Supprimer un hôpital
// router.delete('/:id', deleteHopital);

export default router;
