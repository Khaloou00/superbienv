import { Router } from 'express';
import {
  getMyNotifications, getUnreadCount, sendNotification, createReport,
  markRead, markAllRead, getRecipients,
} from '../controllers/notificationController.js';
import { protect, adminOnly, staffOrAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', protect, getMyNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.get('/recipients', protect, adminOnly, getRecipients);
router.post('/', protect, adminOnly, sendNotification);
router.post('/report', protect, staffOrAdmin, createReport);
router.patch('/read-all', protect, markAllRead);
router.patch('/:id/read', protect, markRead);

export default router;
