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

router.get("/rooms", getRooms);
router.post("/rooms", createRoom);
router.delete("/rooms/:id", deleteRoom);

router.post("/rooms/:roomId/beds", addBed);
router.delete("/rooms/:roomId/beds/:bedId", deleteBed);
router.put("/rooms/:roomId/beds/:bedId/toggle", toggleBedAvailability);

export default router;
