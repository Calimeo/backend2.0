// ESM version: ordonnance.routes.js

import express from 'express';
import {
  createOrdonnance,
  getOrdonnances,
  // getOrdonnanceById,
  // updateOrdonnance,
  // deleteOrdonnance
} from '../controller/ordonnance.controller.js';

const router = express.Router();

router.post('/', createOrdonnance);
router.get('/', getOrdonnances);
// router.get('/:id', getOrdonnanceById);
// router.put('/:id', updateOrdonnance);
// router.delete('/:id', deleteOrdonnance);

export default router;
