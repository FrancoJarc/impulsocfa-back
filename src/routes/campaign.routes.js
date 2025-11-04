import { Router } from 'express';
import { CampaignController } from '../controllers/campaign.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorization } from '../middlewares/authorization.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

// Listar todas las campañas aprobadas
router.get('/', CampaignController.getCampaigns);

// Obtener campaña con estado "pendiente"
router.get('/pending', authenticate, authorization("administrador"), CampaignController.getPendingCampaigns);

// Obtener las ultimas 3 donaciones de una campaña especifica
router.get('/latest/:id', authenticate,  CampaignController.getLatestDonations);

// Obtener campaña por ID
router.get('/:id', CampaignController.getCampaignById);

// Obtener campañas pendientes del usuario logueado
router.get('/pending/user', authenticate, CampaignController.getUserPendingCampaigns);

// Obtener campañas rechazadas del usuario logueado
router.get('/rejected/user', authenticate, CampaignController.getUserRejectedCampaigns);

// Obtener las donaciones de una campaña especifica
router.get('/donation/:id', authenticate, CampaignController.getDonationsByCampaign);


// Crear campaña (usuario logueado)
router.post('/', authenticate, upload.fields([
    { name: "foto1", maxCount: 1 },
    { name: "foto2", maxCount: 1 },
    { name: "foto3", maxCount: 1 }
]), CampaignController.createCampaign);

// Editar campaña (dueño o admin)
router.put('/:id', authenticate, upload.fields([
    { name: "foto1", maxCount: 1 },
    { name: "foto2", maxCount: 1 },
    { name: "foto3", maxCount: 1 }
]), CampaignController.updateCampaign);

// “Eliminar” campaña → cambiar estado a suspendida (dueño o admin)
router.delete('/:id', authenticate, CampaignController.deleteCampaign);

// Aprobar/rechazar campaña (solo admin)
router.patch('/:id/approve', authenticate, authorization("administrador"), CampaignController.approveCampaign);



export default router;
