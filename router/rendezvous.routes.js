// ESM version: rendezvous.routes.js

import express from 'express';
import {
  createRendezVous,
  getRendezVous,
  // getendezVousById,
  // getendezVousByUser,
  // updateendezVous,
  // deleteendezVous
} from '../controller/rendezvous.controller.js';

const router = express.Router();

// Prendre un rendez-vous
router.post('/', createRendezVous);

// Tous les rendez-vous
router.get('/', getRendezVous);

// Rendez-vous par ID
// router.get('/:id', getendezVousById);

// // Rendez-vous d’un utilisateur
// router.get('/user/:userId', getendezVousByUser);

// // Modifier / Supprimer
// router.put('/:id', updateendezVous);
// router.delete('/:id', deleteendezVous);

export default router;
