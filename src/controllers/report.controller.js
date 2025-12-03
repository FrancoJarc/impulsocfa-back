import { ReportService } from "../services/report.service.js";

export class ReportController {

    static async createReporte(req, res) {
        try {
            const id_usuario = req.user.id;

            const reporte = await ReportService.createReporteService({
                ...req.body,
                id_usuario
            });

            return res.status(201).json(reporte);
        } catch (err) {
            console.error(err);
            return res.status(400).json({ error: err.message });
        }
    }

    static async getAllReportes(req, res) {
        try {
            const reportes = await ReportService.getAllReportesService();
            return res.status(200).json(reportes);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

    static async getReporteById(req, res) {
        try {
            const { id_reporte } = req.params;

            const reporte = await ReportService.getReporteByIdService(id_reporte);

            return res.status(200).json(reporte);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

    static async updateReporte(req, res) {
        try {
            const { id_reporte } = req.params;

            const updated = await ReportService.updateReporteService(
                id_reporte,
                req.body
            );

            return res.status(200).json(updated);
        } catch (err) {
            console.error(err);
            return res.status(400).json({ error: err.message });
        }
    }

    static async deleteReporte(req, res) {
        try {
            const { id_reporte } = req.params;

            await ReportService.deleteReporteService(id_reporte);

            return res.status(200).json({ message: "Reporte eliminado" });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
}
