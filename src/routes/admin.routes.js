import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorization } from '../middlewares/authorization.js';

const router = Router();

// Crear nuevo administrador
router.post('/create-admin', authenticate, authorization("administrador"), AdminController.createAdmin);

// Editar datos de un administrador
router.put('/:id', authenticate, authorization("administrador"), AdminController.updateAdmin);

// “Eliminar” un administrador (cambia su estado a deshabilitado)
router.delete('/:id', authenticate, authorization("administrador"), AdminController.deleteAdmin);

// Cambiar el estado de cuenta de un usuario (habilitar, deshabilitar, suspender)
router.patch('/user/:id/state', authenticate, authorization("administrador"), AdminController.changeUserState);

// Obtener todos los administradores
router.get('/', authenticate, authorization("administrador"), AdminController.getAdmins);

// Obtener todos los usuarios normales
router.get('/users', authenticate, authorization("administrador"), AdminController.getUsers);

export default router;
