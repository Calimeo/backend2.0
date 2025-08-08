// ESM version: lit.routes.js

import express from 'express';
import {
  createLit,
  getLits,
  // getLitById,
  // updateLit,
  // deleteLit
} from '../controller/lit.controller.js';

const router = express.Router();

router.post('/', createLit);
router.get('/', getLits);
// router.get('/:id', getLitById);
// router.put('/:id', updateLit);
// router.delete('/:id', deleteLit);

export default router;
