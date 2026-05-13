import mongoose from 'mongoose';
import logger from '../utils/logger.js';

export const notFound = (req, res, next) => {
  const error = new Error(`Route introuvable — ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, _next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose: invalid ObjectId
  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Identifiant invalide : ${err.value}`;
  }

  // Mongoose: schema validation failure
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // MongoDB: duplicate key (e.g. unique email)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'champ';
    message = `La valeur du champ "${field}" est déjà utilisée.`;
  }

  if (statusCode >= 500) {
    logger.error(message, { stack: err.stack, url: req.originalUrl, method: req.method });
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};
