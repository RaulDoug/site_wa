import { Router } from 'express';
import PostController from '../controllers/postController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { validateValues } from '../middleware/validateMiddleware.js';
import { postValidationSchema } from '../middleware/validationSchema.js';
import { validationId } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = Router();
const postController = new PostController();

// Rotas publicas
router.get('/posts', postController.getAll);
router.get('/posts/search', postController.getByParams);
router.get('/posts/:id', validationId, postController.getById);

// Rotas privadas
router.post('/posts',
  authenticateJWT,
  upload.single('image'),
  validateValues(postValidationSchema),
  postController.createPost
);
router.put('/posts/:id',
  authenticateJWT,
  validationId,
  upload.single('image'),
  validateValues(postValidationSchema.partial()),
  postController.update
);
router.delete('/posts/:id', authenticateJWT, validationId, postController.delete);

export default router;
