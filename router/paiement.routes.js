// ESM version: paiement.routes.js

import express from 'express';
import {
  createPaiement,
  getPaiements,
  // getPaiementById,
  // updatePaiement,
  // deletePaiement
} from '../controller/paiement.controller.js';

const router = express.Router();

router.post('/', createPaiement);
router.get('/', getPaiements);
// router.get('/:id', getPaiementById);
// router.put('/:id', updatePaiement);
// router.delete('/:id', deletePaiement);

export default router;
