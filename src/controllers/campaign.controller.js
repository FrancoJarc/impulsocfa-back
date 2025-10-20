import { CampaignService } from '../services/campaign.service.js';

export class CampaignController {
    static async createCampaign(req, res) {
        try {
            const id_usuario = req.user.id; // siempre del token
            const { id_categoria, titulo, descripcion, tiempo_objetivo, monto_objetivo } = req.body;

            /*// Convertir id_categoria a número y validar
            const categoriaId = Number(id_categoria);
            if (isNaN(categoriaId)) throw new Error("Categoría inválida");*/

            const campaign = await CampaignService.createCampaignService({
                id_usuario,
                id_categoria,
                titulo,
                descripcion,
                tiempo_objetivo,
                monto_objetivo,
                file: req.file, // la imagen viene en memoria gracias a multer
            });

            return res.status(201).json(campaign);
        } catch (err) {
            console.error(err);
            return res.status(400).json({ error: err.message });
        }
    }

    static async getCampaigns(req, res) {
        try {
            const filters = req.query;
            const campaigns = await CampaignService.getCampaignsService(filters);
            return res.status(200).json(campaigns);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

    static async getCampaignById(req, res) {
        try {
            const { id } = req.params;
            const campaign = await CampaignService.getCampaignByIdService(id);
            if (!campaign) return res.status(404).json({ error: "Campaña no encontrada" });
            return res.status(200).json(campaign);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

    static async updateCampaign(req, res) {
        try {
            const { id } = req.params;
            const campaign = await CampaignService.getCampaignByIdService(id);

            if (!campaign) return res.status(404).json({ error: "Campaña no encontrada" });

            // Solo dueño o admin
            if (req.user.id !== campaign.id_usuario && req.user.rol !== "administrador") {
                return res.status(403).json({ error: "No tenés permiso para actualizar esta campaña" });
            }

            const hasDonations = await CampaignService.hasDonations(id);

            let updateData = {};
            if (hasDonations) {
                const { titulo, descripcion } = req.body;
                updateData = { titulo, descripcion, estado: "pendiente" }; // requiere aprobación admin
            } else {
                updateData = req.body;
            }

            // 🔹 Pasamos el file al service directamente
            const updatedCampaign = await CampaignService.updateCampaignService(id, updateData, req.file);

            return res.status(200).json(updatedCampaign);
        } catch (err) {
            console.error(err);
            return res.status(400).json({ error: err.message });
        }
    }

    
    static async deleteCampaign(req, res) {
        try {
            const { id } = req.params;
            const campaign = await CampaignService.getCampaignByIdService(id);

            if (!campaign) return res.status(404).json({ error: "Campaña no encontrada" });

            // Solo dueño o admin puede “eliminar” → cambiar estado a suspendida
            if (req.user.id !== campaign.id_usuario && req.user.rol !== 'administrador') {
                return res.status(403).json({ error: "No tenés permiso para suspender esta campaña" });
            }

            await CampaignService.suspendCampaignService(id);
            return res.status(200).json({ message: "Campaña suspendida con éxito" });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

    static async approveCampaign(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;

            const campaign = await CampaignService.getCampaignByIdService(id);
            if (!campaign) return res.status(404).json({ error: "Campaña no encontrada" });

            const updatedCampaign = await CampaignService.approveCampaignService(id, estado);
            return res.status(200).json(updatedCampaign);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }



    static async getPendingCampaigns(req, res) {
        try {
            const campaigns = await CampaignService.getPendingCampaignsService();
            return res.status(200).json(campaigns);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

}
