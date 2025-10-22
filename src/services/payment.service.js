import { Preference, MercadoPagoConfig } from "mercadopago";
import dotenv from "dotenv";

dotenv.config();

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

export class PaymentService {
    static async createPreference({ amount, campaignTitle, campaignId, userId }) {
        try {
            const preference = new Preference(client);

            const body = {
                items: [
                    {
                        title: `Donación a: ${campaignTitle}`,
                        quantity: 1,
                        currency_id: "ARS",
                        unit_price: parseFloat(amount),
                    },
                ],
                back_urls: {
                    success: "http://localhost:5173/pago-exitoso",
                    failure: "http://localhost:5173/pago-fallido",
                    pending: "http://localhost:5173/pago-pendiente",
                },
                auto_return: "approved",
                external_reference: JSON.stringify({ campaignId, userId }),
            };

            const response = await preference.create({ body });
            return response.id; // ID de la preferencia
        } catch (error) {
            throw new Error(error.message);
        }
    }




    static async handleWebhook(paymentId) {
        const payment = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
                Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
            },
        }).then((res) => res.json());

        // Datos útiles
        const { status, transaction_amount, payment_method_id, external_reference, id } = payment;

        // Recuperar los IDs guardados en external_reference
        const { campaignId, userId } = JSON.parse(external_reference);

        // 1️⃣ Insertar en donacion
        const { data: donacion } = await supabase
            .from("donacion")
            .insert({
                id_campana: campaignId,
                id_usuario: userId,
                monto: transaction_amount,
            })
            .select()
            .single();

        // 2️⃣ Insertar en pago
        await supabase.from("pago").insert({
            id_donacion: donacion.id_donacion,
            codigo_transaccion: id.toString(),
            metodo: payment_method_id,
            estado: status,
            comprobante: payment.receipt_url || "",
        });
    }

}
