import { Router } from "express";
import { ComentarioController } from "../controllers/comment.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();


router.post("/", authenticate, ComentarioController.createComentario);

router.get("/campana/:id_campana", ComentarioController.getComentariosByCampana);

router.put("/:id_comentario", authenticate, ComentarioController.updateComentario);

router.delete("/:id_comentario", authenticate,  ComentarioController.deleteComentario);

export default router;
