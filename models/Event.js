import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Soirée corpo', 'Anniversaire', 'Mariage', 'Match', 'Concert', 'Autre'],
      required: true,
    },
    titre: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date },
    capacite: { type: Number },
    prix: { type: Number },
    image: { type: String },
    imagePublicId: { type: String },
    statut: { type: String, enum: ['disponible', 'complet', 'annulé'], default: 'disponible' },
    demandesDevis: [
      {
        nom: String,
        email: String,
        telephone: String,
        message: String,
        dateEvenement: Date,
        nombrePersonnes: Number,
        statut: { type: String, enum: ['nouveau', 'traité', 'accepté', 'refusé'], default: 'nouveau' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Event', eventSchema);
