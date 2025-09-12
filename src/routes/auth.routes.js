import express from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

// Registro con google
router.post('/google', AuthController.registerGoogle);

// Registro normal
router.post('/register', AuthController.registerUser);
router.post("/login", AuthController.loginUser);
router.get('/usuario/llave',authenticate, AuthController.getLlaveMaestra);
router.post('/logout',authenticate, AuthController.logoutUser);
router.post('/change-password', authenticate, AuthController.changePassword);

export default router;
