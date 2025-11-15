import { PaymentService } from "../services/payment.service.js";

export class PaymentController {
    static async createPreference(req, res) {
        try {
            const { amount, campaignTitle, campaignId, llave_maestra } = req.body;
            const userId = req.user.id;
            const preferenceId = await PaymentService.createPreference({
                amount,
                campaignTitle,
                campaignId,
                userId,
                llave_maestra
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


    static async createPreferenceMobile(req, res) {
        try {
            const { amount, campaignTitle, campaignId, llave_maestra } = req.body;
            const userId = req.user.id;

            const result = await PaymentMobileService.createMobilePreference({
                amount,
                campaignTitle,
                campaignId,
                userId,
                llave_maestra,
            });

            return res.status(200).json(result); // { init_point, preference_id }
        } catch (error) {
            console.error("Error mobile createPreference:", error);
            return res.status(500).json({ error: error.message });
        }
    }

}
