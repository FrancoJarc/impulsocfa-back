import { Router } from 'express';
import { CampaignController } from '../controllers/campaign.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorization } from '../middlewares/authorization.js';

const router = Router();

// Listar todas las campañas aprobadas
router.get('/', CampaignController.getCampaigns);

// Obtener campaña con estado "pendiente"
router.get('/pending', authenticate, authorization("administrador"), CampaignController.getPendingCampaigns);

// Obtener campaña por ID
router.get('/:id', authenticate, CampaignController.getCampaignById);

// Crear campaña (usuario logueado)
router.post('/', authenticate, CampaignController.createCampaign);

// Editar campaña (dueño o admin)
router.put('/:id', authenticate, CampaignController.updateCampaign);

// “Eliminar” campaña → cambiar estado a suspendida (dueño o admin)
router.delete('/:id', authenticate, CampaignController.deleteCampaign);

// Aprobar/rechazar campaña (solo admin)
router.patch('/:id/approve', authenticate, authorization("administrador"), CampaignController.approveCampaign);


export default router;
