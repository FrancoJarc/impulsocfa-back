import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller.js";

const router = Router();

router.post("/create_preference", authenticate, PaymentController.createPreference);


router.post("/webhook", PaymentController.webhookNotification);

export default router;
