import { Router } from 'express';
import {
  createBooking, getMesReservations, getBooking, annulerBooking,
  scanQR, getAllBookings, getStats, verifyBooking, scanBookingByNumero,
  getStaffStats, getExpiredStats,
} from '../controllers/bookingController.js';
import { protect, adminOnly, staffOrAdmin } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { createBookingSchema, scanQRSchema } from '../validations/bookingSchemas.js';

const router = Router();

router.post('/', protect, validate(createBookingSchema), createBooking);
router.get('/mes-reservations', protect, getMesReservations);
router.get('/stats', protect, adminOnly, getStats);
router.get('/all', protect, adminOnly, getAllBookings);
router.post('/scan', protect, adminOnly, validate(scanQRSchema), scanQR);
router.get('/stats/staff',   protect, staffOrAdmin, getStaffStats);
router.get('/stats/expired', protect, adminOnly,   getExpiredStats);
router.get('/verify/:numero', verifyBooking);
router.patch('/verify/:numero/scan', protect, staffOrAdmin, scanBookingByNumero);
router.get('/:id', protect, getBooking);
router.put('/:id/annuler', protect, annulerBooking);

export default router;
