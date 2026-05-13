import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Film', required: true },
    seanceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    place: { type: String, required: true },
    isVIP: { type: Boolean, default: false },
    immatriculation: { type: String, required: true, uppercase: true, trim: true },
    nombrePersonnes: { type: Number, required: true, min: 1, max: 6 },
    options: {
      packSnack: { type: Boolean, default: false },
      packBoissons: { type: Boolean, default: false },
      packRomantique: { type: Boolean, default: false },
      packVIP: { type: Boolean, default: false },
    },
    paiement: {
      methode: { type: String, enum: ['Wave', 'OrangeMoney', 'MTNMoMo', 'Carte'], required: true },
      statut: { type: String, enum: ['en_attente', 'confirmé', 'échoué', 'remboursé'], default: 'en_attente' },
      reference: { type: String },
      montant: { type: Number, required: true },
    },
    qrCode: { type: String },
    statut: { type: String, enum: ['active', 'utilisée', 'annulée'], default: 'active' },
    numero: { type: String, unique: true },
  },
  { timestamps: true }
);

bookingSchema.pre('save', function () {
  if (!this.numero) {
    this.numero = `SBV-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  }
});

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ filmId: 1, statut: 1 });
bookingSchema.index({ statut: 1 });

export default mongoose.model('Booking', bookingSchema);
