import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';
import { cloudinary } from '../utils/uploadCloud.js';

const signAccess = (id) =>
  jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });

const signRefresh = (id, version) =>
  jwt.sign({ id, v: version }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { nom, email, password, telephone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      res.status(400);
      return next(new Error('Cet email est déjà utilisé'));
    }
    const user = await User.create({ nom, email, password, telephone });
    const accessToken = signAccess(user._id);
    const refreshToken = signRefresh(user._id, user.refreshTokenVersion);
    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.status(201).json({
      success: true,
      accessToken,
      user: { id: user._id, nom: user.nom, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      return next(new Error('Email ou mot de passe incorrect'));
    }
    if (!user.isActive) {
      res.status(403);
      return next(new Error('Compte désactivé'));
    }
    const accessToken = signAccess(user._id);
    const refreshToken = signRefresh(user._id, user.refreshTokenVersion);
    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.json({
      success: true,
      accessToken,
      user: { id: user._id, nom: user.nom, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh
export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      res.status(401);
      return next(new Error('Refresh token manquant'));
    }
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      res.status(401);
      return next(new Error('Utilisateur introuvable'));
    }
    if (decoded.v !== user.refreshTokenVersion) {
      res.status(401);
      return next(new Error('Session expirée, veuillez vous reconnecter'));
    }
    const accessToken = signAccess(user._id);
    res.json({ success: true, accessToken });
  } catch {
    res.status(401);
    next(new Error('Refresh token invalide'));
  }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      await User.findByIdAndUpdate(decoded.id, { $inc: { refreshTokenVersion: 1 } });
    }
  } catch {
    // Proceed regardless — still clear the cookie
  }
  res.clearCookie('refreshToken', cookieOptions);
  res.json({ success: true, message: 'Déconnecté' });
};

// GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('filmsFavoris', 'titre poster');
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/me
export const updateMe = async (req, res, next) => {
  try {
    const { nom, telephone, idNumber } = req.body;
    const updateData = { nom, telephone, idNumber };
    
    if (req.file) {
      const existing = await User.findById(req.user._id);
      if (existing?.avatar) {
        try {
          const publicId = existing.avatar.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`superbienv/${publicId}`);
        } catch {}
      }
      updateData.avatar = req.file.path;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.json({ success: true, message: 'Email envoyé si le compte existe' });
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Réinitialisation de mot de passe — SUPERBIENV',
      html: `<p>Cliquez <a href="${resetUrl}">ici</a> pour réinitialiser votre mot de passe. Valable 10 minutes.</p>`,
    });
    res.json({ success: true, message: 'Email envoyé' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/reset-password/:token
export const resetPassword = async (req, res, next) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      res.status(400);
      return next(new Error('Token invalide ou expiré'));
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.json({ success: true, message: 'Mot de passe réinitialisé' });
  } catch (err) {
    next(err);
  }
};
