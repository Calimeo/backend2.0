// controllers/chatController.js
import { Message } from "../models/Message.js";
import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";

// 💬 Envoyer un message
export const sendMessage = catchAsyncErrors(async (req, res, next) => {
  const { receiverId, content } = req.body;

  if (!receiverId || !content) {
    return next(new ErrorHandler("Tous les champs sont requis", 400));
  }

  const message = await Message.create({
    sender: req.user._id,
    receiver: receiverId,
    content,
  });

  res.status(201).json({
    success: true,
    message: "Message envoyé avec succès",
    data: message,
  });
});

// 📬 Obtenir l’historique entre 2 utilisateurs
export const getMessages = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new ErrorHandler("L'ID de l'utilisateur est requis", 400));
  }

  const currentUserId = req.user._id;

  const messages = await Message.find({
    $or: [
      { sender: currentUserId, receiver: userId },
      { sender: userId, receiver: currentUserId },
    ],
  })
    .sort({ createdAt: 1 }) // du plus ancien au plus récent
    .populate("sender", "firstName lastName role docAvatar") // facultatif
    .populate("receiver", "firstName lastName role docAvatar");

  res.status(200).json({
    success: true,
    messages,
  });
});

export const getChatUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find({
    _id: { $ne: req.user._id }, // exclure soi-même
  }).select("firstName lastName docAvatar email role");

  res.status(200).json({
    success: true,
    users, // 👈 ici on renvoie bien `users`
  });
});

export const getConversations = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;

  // Récupérer tous les messages où l'utilisateur est soit l'expéditeur, soit le destinataire
  const messages = await Message.find({
    $or: [{ sender: userId }, { receiver: userId }],
  });

  // Extraire les IDs des autres utilisateurs impliqués
  const participantIds = new Set();

  messages.forEach((msg) => {
    if (msg.sender.toString() !== userId.toString()) {
      participantIds.add(msg.sender.toString());
    }
    if (msg.receiver.toString() !== userId.toString()) {
      participantIds.add(msg.receiver.toString());
    }
  });

  // Récupérer les utilisateurs correspondants
  const users = await User.find({ _id: { $in: Array.from(participantIds) } }).select(
    "firstName lastName email _id"
  );

  res.status(200).json({
    success: true,
    users,
  });
});