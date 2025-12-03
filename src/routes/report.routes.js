import { Router } from "express";
import { ReportController } from "../controllers/report.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

// Obtener todos
router.get("/", ReportController.getAllReportes);

// Obtener por ID
router.get("/:id_reporte", ReportController.getReporteById);

// Crear reporte
router.post("/", authenticate, ReportController.createReporte);

// Editar reporte
router.put("/:id_reporte", authenticate, ReportController.updateReporte);

// Eliminar reporte
router.delete("/:id_reporte", authenticate, ReportController.deleteReporte);

export default router;
