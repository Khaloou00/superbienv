import { z } from 'zod';

const GENRES = ['Action', 'Comédie', 'Drame', 'Horreur', 'Romance', 'Thriller', 'Animation', 'Documentaire', 'Sport', 'Concert', 'Événement'];
const TYPES = ['Film', 'Match', 'Événement', 'Concert'];
const BADGES = ['NOUVEAU', 'CE SOIR', 'COMPLET', 'VIP', ''];

// Multipart form values arrive as strings; coerce where needed.
const seanceSchema = z.object({
  date: z.string().min(1, 'Date de séance requise'),
  heure: z.string().min(1, 'Heure de séance requise'),
  placesTotal: z.coerce.number().int().min(1).max(500).optional(),
  placesVIP: z.coerce.number().int().min(0).optional(),
});

const parseJSON = (field) =>
  z.preprocess((val) => {
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return val; }
    }
    return val;
  }, field);

const baseFilmSchema = z.object({
  titre: z.string().min(1, 'Titre requis').max(100),
  synopsis: z.string().min(10, 'Synopsis trop court (min 10 car.)').max(2000),
  genre: z.enum(GENRES, { errorMap: () => ({ message: 'Genre invalide' }) }),
  type: z.enum(TYPES, { errorMap: () => ({ message: 'Type invalide' }) }).optional(),
  duree: z.coerce.number().int().min(1, 'Durée requise').max(600),
  realisateur: z.string().max(100).optional(),
  langue: z.string().max(20).optional(),
  age: z.string().max(20).optional(),
  note: z.coerce.number().min(0).max(10).optional(),
  badge: z.enum(BADGES).optional(),
  trailerUrl: z.string().url('URL invalide').optional().or(z.literal('')),
  seances: parseJSON(z.array(seanceSchema)).optional(),
  casting: parseJSON(z.array(z.string())).optional(),
});

export const createFilmSchema = baseFilmSchema;

// On update all fields are optional (PATCH semantics via PUT)
export const updateFilmSchema = baseFilmSchema.partial();
