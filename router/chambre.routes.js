import express from "express";
import {
  getRooms,
  createRoom,
  deleteRoom,
  addBed,
  deleteBed,
  toggleBedAvailability,
} from "../controller/room.controller.js";

const router = express.Router();

// Routes modifiées pour inclure l'hôpital
router.get("/hospitals/:hospitalId/rooms", getRooms);
router.post("/hospitals/:hospitalId/rooms", createRoom);
router.delete("/hospitals/:hospitalId/rooms/:id", deleteRoom);

// Routes pour la gestion des lits
router.post("/rooms/:roomId/beds", addBed); // hospitalId dans le body
router.delete("/hospitals/:hospitalId/rooms/:roomId/beds/:bedId", deleteBed);
router.put("/hospitals/:hospitalId/rooms/:roomId/beds/:bedId/toggle", toggleBedAvailability);

export default router;