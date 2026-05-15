import { z } from 'zod';

export const registerSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50),
  email: z.email({ message: 'Email invalide' }),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').max(100),
  telephone: z.string().min(8, 'Numéro de téléphone invalide').max(20).optional(),
});

export const loginSchema = z.object({
  email: z.email({ message: 'Email invalide' }),
  password: z.string().min(1, 'Mot de passe requis'),
});

export const forgotPasswordSchema = z.object({
  email: z.email({ message: 'Email invalide' }),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export const updateMeSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50).optional(),
  telephone: z.string().min(8, 'Numéro invalide').max(20).optional(),
  idNumber: z.string().optional(),
});
