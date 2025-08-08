import express from "express";
import {
  sendMessage,
  getMessages,
  getChatUsers,
  getConversations,
} from "../controller/message.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// POST - Envoyer un message
router.post("/send", isAuthenticated, sendMessage);

// GET - Conversation entre deux utilisateurs
router.get("/message/:userId", isAuthenticated, getMessages);

router.get("/chat-users", isAuthenticated, getChatUsers);

router.get("/conversations",isAuthenticated, getConversations);

export default router;
