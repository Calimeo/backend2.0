// ESM version: medecin.routes.js

import express from 'express';
import {
  createMedecin,
  getMedecins,
  // getMedecinById,
  // updateMedecin,
  // deleteMedecin
} from '../controller/medecin.controller.js';

const router = express.Router();

// Créer un médecin
router.post('/', createMedecin);

// Obtenir tous les médecins
router.get('/', getMedecins);

// Obtenir un médecin par ID
// router.get('/:id', getMedecinById);

// // Modifier un médecin
// router.put('/:id', updateMedecin);

// // Supprimer un médecin
// router.delete('/:id', deleteMedecin);

export default router;
