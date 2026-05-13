import Booking from '../models/Booking.js';
import Film from '../models/Film.js';
import { generateQRCode } from '../utils/generateQR.js';
import { sendEmail, bookingConfirmationEmail } from '../utils/sendEmail.js';
import logger from '../utils/logger.js';

const PRIX = {
  standard: 5000,
  vip: 10000,
  packSnack: 3000,
  packBoissons: 2500,
  packRomantique: 5000,
  packVIP: 8000,
};

// POST /api/bookings
export const createBooking = async (req, res, next) => {
  const { filmId, seanceId, place, isVIP, immatriculation, nombrePersonnes, options, paiement } = req.body;
  const placeField = isVIP ? 'placesVIPDisponibles' : 'placesDisponibles';
  let seatDecremented = false;

  try {
    // Atomic check-and-decrement: filter ensures ≥1 seat before decrementing.
    // Single-document update is inherently atomic — no transaction needed.
    const film = await Film.findOneAndUpdate(
      { _id: filmId, seances: { $elemMatch: { _id: seanceId, [placeField]: { $gte: 1 } } } },
      { $inc: { [`seances.$.${placeField}`]: -1 } },
      { new: true }
    );

    if (!film) {
      const exists = await Film.exists({ _id: filmId });
      res.status(exists ? 400 : 404);
      return next(new Error(
        exists ? `Plus de places ${isVIP ? 'VIP ' : ''}disponibles` : 'Film ou séance introuvable'
      ));
    }

    seatDecremented = true;

    let montant = isVIP ? PRIX.vip : PRIX.standard;
    if (options?.packSnack)      montant += PRIX.packSnack;
    if (options?.packBoissons)   montant += PRIX.packBoissons;
    if (options?.packRomantique) montant += PRIX.packRomantique;
    if (options?.packVIP)        montant += PRIX.packVIP;

    const booking = await Booking.create({
      userId: req.user._id,
      filmId, seanceId, place,
      isVIP: !!isVIP,
      immatriculation,
      nombrePersonnes,
      options,
      paiement: { ...paiement, montant, statut: 'confirmé' },
    });

    const qrData = { bookingId: booking._id, numero: booking.numero, filmId, seanceId, place };
    booking.qrCode = await generateQRCode(qrData);
    await booking.save();

    sendEmail({ to: req.user.email, ...bookingConfirmationEmail(booking, film, req.user) })
      .catch((err) => logger.warn('Échec envoi email confirmation', { bookingId: booking._id, err: err.message }));

    res.status(201).json({ success: true, booking });
  } catch (err) {
    // Compensate: re-increment if seat was taken but booking creation failed
    if (seatDecremented) {
      Film.updateOne(
        { _id: filmId, 'seances._id': seanceId },
        { $inc: { [`seances.$.${placeField}`]: 1 } }
      ).catch((e) => logger.error('Seat re-increment failed', { filmId, seanceId, err: e.message }));
    }
    next(err);
  }
};

// GET /api/bookings/mes-reservations
export const getMesReservations = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('filmId', 'titre poster genre')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/:id
export const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('filmId', 'titre poster genre seances')
      .populate('userId', 'nom email');
    if (!booking) {
      res.status(404);
      return next(new Error('Réservation introuvable'));
    }
    if (booking.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      return next(new Error('Accès refusé'));
    }
    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// PUT /api/bookings/:id/annuler
export const annulerBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404);
      return next(new Error('Réservation introuvable'));
    }
    if (booking.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Accès refusé'));
    }
    if (booking.statut === 'utilisée') {
      res.status(400);
      return next(new Error('Réservation déjà utilisée'));
    }
    booking.statut = 'annulée';
    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// POST /api/bookings/scan — admin only
export const scanQR = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const query = bookingId.startsWith('SBV-') ? { numero: bookingId } : { _id: bookingId };
    const booking = await Booking.findOne(query).populate('filmId', 'titre').populate('userId', 'nom');
    if (!booking) {
      res.status(404);
      return next(new Error('Réservation introuvable'));
    }
    if (booking.statut === 'annulée') {
      res.status(400);
      return next(new Error('Réservation annulée'));
    }
    if (booking.statut === 'utilisée') {
      return res.json({ success: false, message: 'QR déjà utilisé', booking });
    }
    booking.statut = 'utilisée';
    await booking.save();
    res.json({ success: true, message: 'Entrée validée', booking });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings — admin
export const getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, statut } = req.query;
    const filter = statut ? { statut } : {};
    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate('filmId', 'titre')
      .populate('userId', 'nom email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, total, bookings });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/stats — admin
export const getStats = async (_req, res, next) => {
  try {
    const totalReservations = await Booking.countDocuments({ statut: { $ne: 'annulée' } });
    const recettes = await Booking.aggregate([
      { $match: { 'paiement.statut': 'confirmé' } },
      { $group: { _id: null, total: { $sum: '$paiement.montant' } } },
    ]);
    const tauxOccupation = await Booking.aggregate([
      { $match: { statut: 'active' } },
      { $group: { _id: '$filmId', count: { $sum: 1 } } },
    ]);
    res.json({
      success: true,
      stats: {
        totalReservations,
        recettesTotales: recettes[0]?.total || 0,
        tauxOccupation,
      },
    });
  } catch (err) {
    next(err);
  }
};
