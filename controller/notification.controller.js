// ESM version: notification.controller.js

import Notification from "../models/Notification.js";

export const createNotification = async (req, res) => {
  try {
    const notif = new Notification(req.body);
    await notif.save();
    res.status(201).json(notif);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifs = await Notification.find().populate("destinataire");
    res.json(notifs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
