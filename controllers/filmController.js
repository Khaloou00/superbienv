import Film from '../models/Film.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { cloudinary } from '../utils/uploadCloud.js';
import logger from '../utils/logger.js';

// GET /api/films
export const getFilms = async (req, res, next) => {
  try {
    const { genre, type, date, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };
    if (genre) filter.genre = genre;
    if (type) filter.type = type;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter['seances.date'] = { $gte: start, $lt: end };
    }
    const total = await Film.countDocuments(filter);
    const films = await Film.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, total, page: Number(page), films });
  } catch (err) {
    next(err);
  }
};

// GET /api/films/:id
export const getFilm = async (req, res, next) => {
  try {
    const film = await Film.findById(req.params.id);
    if (!film) {
      res.status(404);
      return next(new Error('Film introuvable'));
    }
    res.json({ success: true, film });
  } catch (err) {
    next(err);
  }
};

// POST /api/films — admin
export const createFilm = async (req, res, next) => {
  try {
    const filmData = { ...req.body };
    if (req.file) {
      filmData.poster = req.file.path;
      filmData.posterPublicId = req.file.filename;
    }
    // Auto-sync disponibles from total so newly created séances start full
    if (filmData.seances?.length) {
      filmData.seances = filmData.seances.map((s) => ({
        ...s,
        placesDisponibles:    s.placesTotal ?? 80,
        placesVIPDisponibles: s.placesVIP   ?? 10,
      }));
    }
    const film = await Film.create(filmData);
    res.status(201).json({ success: true, film });
  } catch (err) {
    next(err);
  }
};

// PUT /api/films/:id — admin
export const updateFilm = async (req, res, next) => {
  try {
    const filmData = { ...req.body };
    if (req.file) {
      const existing = await Film.findById(req.params.id);
      if (existing?.posterPublicId) {
        cloudinary.uploader.destroy(existing.posterPublicId)
          .catch((err) => logger.warn('Cloudinary destroy failed', { id: existing.posterPublicId, err: err.message }));
      }
      filmData.poster = req.file.path;
      filmData.posterPublicId = req.file.filename;
    }
    const film = await Film.findByIdAndUpdate(req.params.id, filmData, { new: true, runValidators: true });
    if (!film) {
      res.status(404);
      return next(new Error('Film introuvable'));
    }
    res.json({ success: true, film });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/films/:id — admin
// Soft-deletes the film and cascades: cancels active bookings + removes from favorites.
// The document is kept so existing booking.filmId references remain populatable.
export const deleteFilm = async (req, res, next) => {
  try {
    const film = await Film.findById(req.params.id);
    if (!film) {
      res.status(404);
      return next(new Error('Film introuvable'));
    }

    // 1. Soft-delete — hide from all public listings
    film.isActive = false;
    await film.save();

    // 2. Cancel every active booking for this film so users aren't charged
    const { modifiedCount } = await Booking.updateMany(
      { filmId: film._id, statut: 'active' },
      { statut: 'annulée' }
    );

    // 3. Remove film from every user's favorites list
    await User.updateMany(
      { filmsFavoris: film._id },
      { $pull: { filmsFavoris: film._id } }
    );

    logger.info('Film soft-deleted', {
      filmId: film._id,
      titre: film.titre,
      bookingsCancelled: modifiedCount,
    });

    res.json({
      success: true,
      message: 'Film désactivé',
      bookingsCancelled: modifiedCount,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/films/:id/favoris — user
export const toggleFavori = async (req, res, next) => {
  try {
    const user = req.user;
    const filmId = req.params.id;
    const idx = user.filmsFavoris.indexOf(filmId);
    if (idx > -1) {
      user.filmsFavoris.splice(idx, 1);
    } else {
      user.filmsFavoris.push(filmId);
    }
    await user.save();
    res.json({ success: true, filmsFavoris: user.filmsFavoris });
  } catch (err) {
    next(err);
  }
};

// POST /api/films/:id/commentaires
export const addComment = async (req, res, next) => {
  try {
    const { texte, note } = req.body;
    const film = await Film.findById(req.params.id);
    if (!film) {
      res.status(404);
      return next(new Error('Film introuvable'));
    }
    
    const alreadyCommented = film.commentaires.find(c => c.userId.toString() === req.user._id.toString());
    if (alreadyCommented) {
      res.status(400);
      return next(new Error('Vous avez déjà laissé un avis pour ce film'));
    }

    film.commentaires.push({ userId: req.user._id, texte, note: Number(note) || 0 });
    await film.save();
    await film.populate('commentaires.userId', 'nom avatar');
    
    res.status(201).json({ success: true, commentaires: film.commentaires });
  } catch (err) {
    next(err);
  }
};
