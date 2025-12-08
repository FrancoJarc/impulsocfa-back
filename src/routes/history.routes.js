import { Router } from "express";
import { HistoryController } from "../controllers/history.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { uploadMedia } from "../middlewares/uploadMedia.middleware.js";

const router = Router();

// Obtener TODAS las historias
router.get("/", HistoryController.getAllHistories);

// Obtener todas las historias que tiene una campaña. Puede ser la de 50% o la de 100%
router.get("/campaign/:id_campana", HistoryController.getHistoriesByCampaign);

// Obtener historia + datos de su campaña + datos del usuario que la creo
router.get("/:id", HistoryController.getHistoryWithCampaign);



// Crear historia
router.post("/",authenticate, uploadMedia.fields([
        { name: "archivo1", maxCount: 1 },
        { name: "archivo2", maxCount: 1 },
        { name: "archivo3", maxCount: 1 },
    ]), HistoryController.createHistory);


// Editar historia
router.put(
    "/:id_historia",
    authenticate,
    uploadMedia.fields([
        { name: "archivo1", maxCount: 1 },
        { name: "archivo2", maxCount: 1 },
        { name: "archivo3", maxCount: 1 },
    ]),
    HistoryController.updateHistory
);

// Eliminar historia
router.delete("/:id_historia", authenticate, HistoryController.deleteHistory);

export default router;
