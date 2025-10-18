import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

router.post('/google', AuthController.registerGoogle);
router.post('/register', upload.single("foto_perfil") ,AuthController.registerUser);
router.post("/login", AuthController.loginUser);
router.get('/usuario/llave',authenticate, AuthController.getLlaveMaestra);
router.post('/logout',authenticate, AuthController.logoutUser);
router.post('/change-password', AuthController.changePassword);

export default router;
