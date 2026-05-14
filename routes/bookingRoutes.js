import { Router } from 'express';
import {
  createBooking, getMesReservations, getBooking, annulerBooking,
  scanQR, getAllBookings, getStats, verifyBooking, scanBookingByNumero,
} from '../controllers/bookingController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { createBookingSchema, scanQRSchema } from '../validations/bookingSchemas.js';

const router = Router();

router.post('/', protect, validate(createBookingSchema), createBooking);
router.get('/mes-reservations', protect, getMesReservations);
router.get('/stats', protect, adminOnly, getStats);
router.get('/all', protect, adminOnly, getAllBookings);
router.post('/scan', protect, adminOnly, validate(scanQRSchema), scanQR);
router.get('/verify/:numero', verifyBooking);
router.patch('/verify/:numero/scan', protect, adminOnly, scanBookingByNumero);
router.get('/:id', protect, getBooking);
router.put('/:id/annuler', protect, annulerBooking);

export default router;
