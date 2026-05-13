import { Router } from 'express';
import {
  register, login, refresh, logout, getMe, updateMe,
  forgotPassword, resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { upload } from '../utils/uploadCloud.js';
import {
  registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, updateMeSchema,
} from '../validations/authSchemas.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.put('/reset-password/:token', validate(resetPasswordSchema), resetPassword);
router.get('/me', protect, getMe);
router.put('/me', protect, upload.single('avatar'), validate(updateMeSchema), updateMe);

export default router;
