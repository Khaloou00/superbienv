import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    // message = envoyé par l'admin ; report = signalement envoyé par le staff
    kind: { type: String, enum: ['message', 'report'], required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Ciblage : un utilisateur précis, tout le staff, tous les clients, ou l'admin (signalements)
    audience: { type: String, enum: ['user', 'all_staff', 'all_clients', 'admin'], required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // utilisé si audience='user'

    titre: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
    categorie: { type: String, enum: ['info', 'technique', 'securite', 'client', 'autre'], default: 'info' },
    priorite: { type: String, enum: ['normale', 'haute', 'urgente'], default: 'normale' },

    // Suivi de lecture (gère aussi les diffusions : un user est "lu" si son id est présent)
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

notificationSchema.index({ audience: 1, recipient: 1, createdAt: -1 });
notificationSchema.index({ kind: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
