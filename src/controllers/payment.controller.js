import { PaymentService } from "../services/payment.service.js";

export class PaymentController {
    static async createPreference(req, res) {
        try {
            const { amount, campaignTitle, campaignId } = req.body;
            const userId = req.user.id;
            const preferenceId = await PaymentService.createPreference({
                amount,
                campaignTitle,
                campaignId,
                userId,
            });
            return res.status(200).json({ id: preferenceId });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }


    static async webhookNotification(req, res) {
        try {
            const payment = req.body;

            // Verificar tipo de notificación
            if (payment.type === "payment") {
                // Obtener detalles del pago desde Mercado Pago
                await PaymentService.handleWebhook(payment.data.id);
            }

            return res.sendStatus(200);
        } catch (error) {
            console.error("Error en webhook:" , error);
            return res.status(500).json({ error: error.message });
        }
    }

}
