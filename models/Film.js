import mongoose from 'mongoose';

const seanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  heure: { type: String, required: true },
  placesTotal: { type: Number, default: 80 },
  placesDisponibles: { type: Number, default: 80 },
  placesVIP: { type: Number, default: 10 },
  placesVIPDisponibles: { type: Number, default: 10 },
});

const filmSchema = new mongoose.Schema(
  {
    titre: { type: String, required: true, trim: true },
    poster: { type: String, required: true },
    posterPublicId: { type: String },
    synopsis: { type: String, required: true },
    genre: {
      type: String,
      required: true,
      enum: ['Action', 'Comédie', 'Drame', 'Horreur', 'Romance', 'Thriller', 'Animation', 'Documentaire', 'Sport', 'Concert', 'Événement'],
    },
    duree: { type: Number, required: true },
    realisateur: { type: String },
    casting: [String],
    note: { type: Number, min: 0, max: 10, default: 0 },
    langue: { type: String, default: 'VF' },
    age: { type: String, default: 'Tout public' },
    type: { type: String, enum: ['Film', 'Match', 'Événement', 'Concert'], default: 'Film' },
    seances: [seanceSchema],
    badge: { type: String, enum: ['NOUVEAU', 'CE SOIR', 'COMPLET', 'VIP', ''], default: '' },
    isActive: { type: Boolean, default: true },
    trailerUrl: { type: String },
    commentaires: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      texte: { type: String, required: true },
      note: { type: Number, min: 0, max: 10 },
      date: { type: Date, default: Date.now }
    }],
  },
  { timestamps: true }
);

filmSchema.index({ genre: 1, type: 1 });

export default mongoose.model('Film', filmSchema);
