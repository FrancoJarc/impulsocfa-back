import express from 'express';
import { AuthController } from '../controllers/auth.controller.js';

const router = express.Router();

// Registro con google
router.post('/google', AuthController.registerGoogle);

// Registro normal
router.post('/register', AuthController.registerUser);

export default router;
