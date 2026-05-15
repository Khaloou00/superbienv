import { z } from 'zod';

const EVENT_TYPES = ['Soirée corpo', 'Anniversaire', 'Mariage', 'Match', 'Concert', 'Autre'];

const baseEventSchema = z.object({
  type: z.enum(EVENT_TYPES, { errorMap: () => ({ message: 'Type d\'événement invalide' }) }),
  titre: z.string().min(2, 'Titre requis').max(100),
  description: z.string().min(10, 'Description trop courte').max(2000),
  date: z.string().optional(),
  capacite: z.coerce.number().int().min(1).optional(),
  prix: z.coerce.number().min(0).optional(),
  statut: z.enum(['disponible', 'complet', 'annulé']).optional(),
});

export const createEventSchema = baseEventSchema;
export const updateEventSchema = baseEventSchema.partial();

export const devisSchema = z.object({
  nom: z.string().min(2, 'Nom requis').max(100),
  email: z.email({ message: 'Email invalide' }),
  telephone: z.string().min(8, 'Téléphone invalide').max(20),
  dateEvenement: z.string().optional(),
  nombrePersonnes: z.coerce.number().int().min(1, 'Nombre de personnes requis'),
  message: z.string().min(10, 'Message trop court (min 10 car.)').max(2000),
});
