// ESM version: notification.routes.js

import express from 'express';
import {
  createNotification,
  getNotifications,
  // markAsRead,
  // deleteNotification
} from '../controller/notification.controller.js';

const router = express.Router();

router.post('/', createNotification);
router.get('/', getNotifications);
// router.put('/:id/read', markAsRead);
// router.delete('/:id', deleteNotification);

export default router;
