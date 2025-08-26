import express from "express";
import {
  createRoom,
  addBedToRoom,
  getHospitalRooms,
  getRoom,
  updateRoom,
  deleteRoom,
  updateBedStatus,
  getRoomStats,
  getHospitalRoomsSimple
} from "../controller/room.controller.js";
import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/auth.js";

const router = express.Router();

// Routes protégées pour les hôpitaux
router.post("/add", isAuthenticated, createRoom);
router.post("/:roomId/beds", isAuthenticated, addBedToRoom);
router.get("/", isAuthenticated, getHospitalRooms);
router.get("/simple", isAuthenticated, getHospitalRoomsSimple);
router.get("/stats", isAuthenticated, getRoomStats);
router.get("/:roomId", isAuthenticated, getRoom);
router.put("/:roomId", isAuthenticated, updateRoom);
router.delete("/:roomId", isAuthenticated, deleteRoom);
router.put("/:roomId/beds/:bedId", isAuthenticated, updateBedStatus);

export default router;