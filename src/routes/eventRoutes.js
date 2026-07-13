import { Router } from 'express';
import EventController from '../controllers/eventController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { validateValues } from '../middleware/validateMiddleware.js';
import { eventValidationSchema } from '../middleware/validationSchema.js';
import { validationId } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = Router();
const eventController = new EventController();

// Rotas publicas
router.get('/events', eventController.getAll);
router.get('/events/search', eventController.getByParams);
router.get('/events/:id', validationId, eventController.getById);

// Rotas privadas
router.post('/events',
  authenticateJWT,
  upload.single('image'),
  validateValues(eventValidationSchema),
  eventController.createEvent
);
router.put('/events/:id',
  authenticateJWT,
  validationId,
  upload.single('image'),
  validateValues(eventValidationSchema.partial()),
  eventController.update
);
router.delete('/events/:id', authenticateJWT, validationId, eventController.delete);

export default router;
