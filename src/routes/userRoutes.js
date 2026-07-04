import { Router } from 'express';
import UserController from '../controllers/userController.js';
import { validateValues } from '../middleware/validateMiddleware.js';
import { userAuthSchema } from '../middleware/validationSchema.js';
import { loginLimit } from '../middleware/authMiddleware.js';

const router = Router();
const userController = new UserController();

router.post('/cadastrar', userController.cadUser);
router.post('/login', loginLimit, validateValues(userAuthSchema), userController.userLogin);

export default router;
