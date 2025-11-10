import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { upload } from '../middlewares/upload.middleware.js';
import { authenticate } from "../middlewares/authenticate.js"; // middleware de login


const router = Router();

// Editar perfil
router.put("/", authenticate, upload.single("foto_perfil"), UserController.updateUser);

router.patch("/disable", authenticate, UserController.disableAccount);

router.get("/total", authenticate, UserController.getTotalDonacionesUsuario);

router.get("/total/:id_campana", authenticate, UserController.getTotalDonacionesCampana);

export default router;
