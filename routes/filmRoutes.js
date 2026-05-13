import { Router } from 'express';
import {
  getFilms, getFilm, createFilm, updateFilm, deleteFilm, toggleFavori, addComment
} from '../controllers/filmController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { createFilmSchema, updateFilmSchema } from '../validations/filmSchemas.js';
import { upload } from '../utils/uploadCloud.js';

const router = Router();

router.get('/', getFilms);
router.get('/:id', getFilm);
// validate runs after upload so req.body is populated by multer
router.post('/', protect, adminOnly, upload.single('poster'), validate(createFilmSchema), createFilm);
router.put('/:id', protect, adminOnly, upload.single('poster'), validate(updateFilmSchema), updateFilm);
router.delete('/:id', protect, adminOnly, deleteFilm);
router.post('/:id/favoris', protect, toggleFavori);
router.post('/:id/commentaires', protect, addComment);

export default router;
