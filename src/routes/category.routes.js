import express from 'express';
import { CategoryController } from '../controllers/category.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorization } from '../middlewares/authorization.js';

const router = express.Router();

router.get('/', CategoryController.getCategories);
router.post('/', authenticate, authorization("administrador"), CategoryController.createCategory);
router.put('/:id', authenticate, authorization("administrador"), CategoryController.updateCategory);
router.delete('/:id', authenticate, authorization("administrador"), CategoryController.deleteCategory);

export default router;
