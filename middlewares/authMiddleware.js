import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401);
    return next(new Error('Non autorisé — token manquant'));
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user || !req.user.isActive) {
      res.status(401);
      return next(new Error('Non autorisé — compte inactif'));
    }
    next();
  } catch {
    res.status(401);
    next(new Error('Non autorisé — token invalide'));
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    res.status(403);
    return next(new Error('Accès refusé — réservé aux administrateurs'));
  }
  next();
};
