import http from "http";
import { Server } from "socket.io";
import app from './app.js';
import cloudinary from "cloudinary";
import { config } from "dotenv";

config({ path: "./config/config.env" });

// Configuration Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Créer un serveur HTTP basé sur ton app Express
const server = http.createServer(app);

// Initialiser Socket.IO avec configuration CORS
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL,
      process.env.DASHBOARD_URL,
      process.env.DASHBOARDHOPITAL_URL,
      process.env.DASHBOARDDOCTOR_URL
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Stocker l'instance de Socket.IO dans l'app pour l'utiliser ailleurs
app.set("io", io);

// Gestion des connexions
io.on("connection", (socket) => {
  console.log("🟢 Utilisateur connecté : ", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`👥 Utilisateur ${socket.id} a rejoint la room ${roomId}`);
  });

  socket.on("sendMessage", (message) => {
    // message.receiver doit être l'ID du destinataire
    io.to(message.receiver).emit("newMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Utilisateur déconnecté :", socket.id);
  });
});

// Lancer le serveur
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`✅ Serveur en ligne sur http://localhost:${PORT}`);
});
