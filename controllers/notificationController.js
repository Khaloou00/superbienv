import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

// Construit le filtre des notifications visibles par un utilisateur selon son rôle
const audienceFilter = (user) => {
  const me = user._id;
  if (user.role === 'admin') {
    // L'admin voit les signalements du staff + les messages qui lui sont adressés
    return { $or: [{ audience: 'admin' }, { audience: 'user', recipient: me }] };
  }
  if (user.role === 'staff') {
    return { $or: [{ audience: 'all_staff' }, { audience: 'user', recipient: me }] };
  }
  return { $or: [{ audience: 'all_clients' }, { audience: 'user', recipient: me }] };
};

const shape = (n, meId) => ({
  ...n,
  read: (n.readBy || []).some((id) => id.toString() === meId.toString()),
  readBy: undefined,
});

// GET /api/notifications — liste rôle-dépendante + compteur non-lus
export const getMyNotifications = async (req, res, next) => {
  try {
    const filter = audienceFilter(req.user);
    const docs = await Notification.find(filter)
      .populate('sender', 'nom role')
      .populate('recipient', 'nom email role')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const notifications = docs.map((n) => shape(n, req.user._id));
    const unread = notifications.filter((n) => !n.read).length;

    res.json({ success: true, unread, notifications });
  } catch (err) {
    next(err);
  }
};

// GET /api/notifications/unread-count
export const getUnreadCount = async (req, res, next) => {
  try {
    const filter = { ...audienceFilter(req.user), readBy: { $ne: req.user._id } };
    const unread = await Notification.countDocuments(filter);
    res.json({ success: true, unread });
  } catch (err) {
    next(err);
  }
};

// POST /api/notifications — admin envoie un message (ciblage au cas par cas)
export const sendNotification = async (req, res, next) => {
  try {
    const { audience, recipient, titre, message, categorie, priorite } = req.body;

    if (!message?.trim()) {
      res.status(400);
      return next(new Error('Le message est requis'));
    }
    if (!['user', 'all_staff', 'all_clients'].includes(audience)) {
      res.status(400);
      return next(new Error('Cible invalide'));
    }
    if (audience === 'user' && !mongoose.isValidObjectId(recipient)) {
      res.status(400);
      return next(new Error('Destinataire invalide'));
    }

    const notif = await Notification.create({
      kind: 'message',
      sender: req.user._id,
      audience,
      recipient: audience === 'user' ? recipient : undefined,
      titre: titre?.trim(),
      message: message.trim(),
      categorie: categorie || 'info',
      priorite: priorite || 'normale',
      readBy: [req.user._id], // l'expéditeur a "lu" son propre message
    });

    logger.info('Notification envoyée', { id: notif._id, audience, by: req.user._id });
    res.status(201).json({ success: true, notification: notif });
  } catch (err) {
    next(err);
  }
};

// POST /api/notifications/report — staff signale un problème à l'admin
export const createReport = async (req, res, next) => {
  try {
    const { titre, message, categorie, priorite } = req.body;
    if (!message?.trim()) {
      res.status(400);
      return next(new Error('Décrivez le problème'));
    }

    const notif = await Notification.create({
      kind: 'report',
      sender: req.user._id,
      audience: 'admin',
      titre: titre?.trim(),
      message: message.trim(),
      categorie: categorie || 'autre',
      priorite: priorite || 'normale',
      readBy: [req.user._id],
    });

    logger.info('Signalement staff créé', { id: notif._id, by: req.user._id, priorite });
    res.status(201).json({ success: true, notification: notif });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/:id/read
export const markRead = async (req, res, next) => {
  try {
    await Notification.updateOne(
      { _id: req.params.id },
      { $addToSet: { readBy: req.user._id } }
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/read-all
export const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      audienceFilter(req.user),
      { $addToSet: { readBy: req.user._id } }
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// GET /api/notifications/recipients — admin : liste staff + clients pour le ciblage
export const getRecipients = async (req, res, next) => {
  try {
    const users = await User.find({ role: { $in: ['staff', 'user'] } })
      .select('nom email role')
      .sort({ role: 1, nom: 1 })
      .lean();
    res.json({
      success: true,
      staff: users.filter((u) => u.role === 'staff'),
      clients: users.filter((u) => u.role === 'user'),
    });
  } catch (err) {
    next(err);
  }
};
