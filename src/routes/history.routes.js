import { Router } from "express";
import { HistoryController } from "../controllers/history.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// Obtener TODAS las historias
router.get("/", HistoryController.getAllHistories);

// Obtener historia + datos de su campaña
router.get("/:id", HistoryController.getHistoryWithCampaign);

// Crear historia
router.post("/",authenticate, upload.fields([
        { name: "archivo1", maxCount: 1 },
        { name: "archivo2", maxCount: 1 },
        { name: "archivo3", maxCount: 1 },
    ]), HistoryController.createHistory);


// Editar historia
router.put(
    "/:id_historia",
    authenticate,
    upload.fields([
        { name: "archivo1", maxCount: 1 },
        { name: "archivo2", maxCount: 1 },
        { name: "archivo3", maxCount: 1 },
    ]),
    HistoryController.updateHistory
);

// Eliminar historia
router.delete("/:id_historia", authenticate, HistoryController.deleteHistory);

export default router;
