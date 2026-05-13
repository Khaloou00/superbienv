import Event from '../models/Event.js';
import { cloudinary } from '../utils/uploadCloud.js';
import { sendEmail } from '../utils/sendEmail.js';
import logger from '../utils/logger.js';

// GET /api/events
export const getEvents = async (_req, res, next) => {
  try {
    const events = await Event.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, events });
  } catch (err) {
    next(err);
  }
};

// GET /api/events/:id
export const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404);
      return next(new Error('Événement introuvable'));
    }
    res.json({ success: true, event });
  } catch (err) {
    next(err);
  }
};

// POST /api/events — admin
export const createEvent = async (req, res, next) => {
  try {
    const eventData = { ...req.body };
    if (req.file) {
      eventData.image = req.file.path;
      eventData.imagePublicId = req.file.filename;
    }
    const event = await Event.create(eventData);
    res.status(201).json({ success: true, event });
  } catch (err) {
    next(err);
  }
};

// PUT /api/events/:id — admin
export const updateEvent = async (req, res, next) => {
  try {
    const eventData = { ...req.body };
    if (req.file) {
      const existing = await Event.findById(req.params.id);
      if (existing?.imagePublicId) {
        cloudinary.uploader.destroy(existing.imagePublicId)
          .catch((err) => logger.warn('Cloudinary destroy failed', { id: existing.imagePublicId, err: err.message }));
      }
      eventData.image = req.file.path;
      eventData.imagePublicId = req.file.filename;
    }
    const event = await Event.findByIdAndUpdate(req.params.id, eventData, { new: true });
    if (!event) {
      res.status(404);
      return next(new Error('Événement introuvable'));
    }
    res.json({ success: true, event });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/events/:id — admin
// Soft-deletes the event; demandesDevis are embedded so no cascade needed.
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404);
      return next(new Error('Événement introuvable'));
    }

    event.isActive = false;
    await event.save();

    logger.info('Event soft-deleted', { eventId: event._id, titre: event.titre });

    res.json({ success: true, message: 'Événement désactivé' });
  } catch (err) {
    next(err);
  }
};

// POST /api/events/:id/devis — public
export const demanderDevis = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404);
      return next(new Error('Événement introuvable'));
    }
    const { nom, email, telephone, message, dateEvenement, nombrePersonnes } = req.body;
    event.demandesDevis.push({ nom, email, telephone, message, dateEvenement, nombrePersonnes });
    await event.save();

    sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `Nouvelle demande de devis — ${event.titre}`,
      html: `<p><strong>${nom}</strong> (${email}, ${telephone}) demande un devis pour "${event.titre}".<br/>Date : ${dateEvenement}<br/>Personnes : ${nombrePersonnes}<br/>Message : ${message}</p>`,
    }).catch((err) => logger.warn('Échec envoi email devis', { eventId: event._id, err: err.message }));

    res.status(201).json({ success: true, message: 'Demande envoyée avec succès' });
  } catch (err) {
    next(err);
  }
};
