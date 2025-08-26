// routes/laboratoryRoutes.js
// routes/laboratoryRoutes.js
import express from 'express';
import {
  createLaboratory,
  getLaboratories,
  addPatientToLaboratory,
  addTestResult,
  getLaboratoryById,
  deleteLaboratory
} from '../controller/laboratoire.controller.js';
import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/auth.js"; // Votre middleware d'authentification

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(isAuthenticated);

router.post('/create', createLaboratory);
router.get('/', getLaboratories);
router.get('/:id', getLaboratoryById);
router.delete('/:id', deleteLaboratory);
router.post('/patients', addPatientToLaboratory);
router.post('/tests', addTestResult);

export default router;
