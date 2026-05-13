import { z } from 'zod';

const objectId = z.string().length(24, 'Identifiant invalide');

export const createBookingSchema = z.object({
  filmId: objectId,
  seanceId: objectId,
  place: z.string().min(2, 'Place invalide').max(5),
  isVIP: z.boolean().optional().default(false),
  immatriculation: z.string().min(2, 'Immatriculation invalide').max(15),
  nombrePersonnes: z.coerce.number().int().min(1).max(6),
  options: z.object({
    packSnack: z.boolean().optional().default(false),
    packBoissons: z.boolean().optional().default(false),
    packRomantique: z.boolean().optional().default(false),
    packVIP: z.boolean().optional().default(false),
  }).optional().default({}),
  paiement: z.object({
    methode: z.enum(['Wave', 'OrangeMoney', 'MTNMoMo', 'Carte'], {
      errorMap: () => ({ message: 'Méthode de paiement invalide' }),
    }),
  }),
});

export const scanQRSchema = z.object({
  bookingId: z.string().min(3, 'ID invalide'),
});
