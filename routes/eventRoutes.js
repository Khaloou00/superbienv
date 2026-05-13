import { Router } from 'express';
import {
  getEvents, getEvent, createEvent, updateEvent, deleteEvent, demanderDevis,
} from '../controllers/eventController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { createEventSchema, updateEventSchema, devisSchema } from '../validations/eventSchemas.js';
import { upload } from '../utils/uploadCloud.js';

const router = Router();

router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', protect, adminOnly, upload.single('image'), validate(createEventSchema), createEvent);
router.put('/:id', protect, adminOnly, upload.single('image'), validate(updateEventSchema), updateEvent);
router.delete('/:id', protect, adminOnly, deleteEvent);
router.post('/:id/devis', validate(devisSchema), demanderDevis);

export default router;
