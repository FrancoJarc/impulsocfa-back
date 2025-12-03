import { HistoryService } from "../services/history.service.js";

export class HistoryController {



    static async createHistory(req, res) {
        try {
            const id_usuario = req.user.id;
            const body = req.body;

            const history = await HistoryService.createHistoryService({
                ...body,
                id_usuario,
                files: req.files
            });

            return res.status(201).json(history);
        } catch (err) {
            console.error(err);
            return res.status(400).json({ error: err.message });
        }
    }

    static async getAllHistories(req, res) {
        try {
            const histories = await HistoryService.getAllHistoriesService();
            return res.status(200).json(histories);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

    static async getHistoryWithCampaign(req, res) {
        try {
            const { id } = req.params;
            const history = await HistoryService.getHistoryWithCampaignService(id);
            return res.status(200).json(history);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }


    static async getHistoriesByCampaign(req, res) {
        try {
            const { id_campana } = req.params;
            const histories = await HistoryService.getHistoriesByCampaignService(id_campana);
            return res.status(200).json(histories);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }


    
    static async updateHistory(req, res) {
        try {
            const { id_historia } = req.params;

            const updated = await HistoryService.updateHistoryService(
                id_historia,
                req.body,
                req.files
            );

            return res.status(200).json(updated);
        } catch (err) {
            console.error(err);
            return res.status(400).json({ error: err.message });
        }
    }

    static async deleteHistory(req, res) {
        try {
            const { id_historia } = req.params;
            await HistoryService.deleteHistoryService(id_historia);
            return res.status(200).json({ message: "Historia eliminada" });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

}
