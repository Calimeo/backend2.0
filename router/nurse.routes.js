// routes/nurseRoutes.js
import express from 'express';
import {
  addNurse,
  listNurses,
  deleteNurse,
  scheduleShifts,
  completeShift,
  getWorkedHours,
  getOnDutyNurses,
  listAllShifts
} from '../controller/nurse.controller.js';
import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/auth.js";

const router = express.Router();

router.post('/', isAuthenticated, addNurse);
router.get('/', isAuthenticated, listNurses);
router.delete('/:id', isAuthenticated, deleteNurse);
router.post('/shifts', isAuthenticated, scheduleShifts);
router.put('/shifts/complete', isAuthenticated, completeShift);
router.get('/hours', isAuthenticated, getWorkedHours);
router.get('/on-duty', isAuthenticated, getOnDutyNurses);
router.get('/shifts', isAuthenticated, listAllShifts);

export default router;