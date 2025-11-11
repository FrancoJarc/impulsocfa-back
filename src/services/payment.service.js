import { Preference, MercadoPagoConfig } from "mercadopago";
import dotenv from "dotenv";
import supabase from "../config/supabase.js";

dotenv.config();

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

export class PaymentService {
    static async createPreference({ amount, campaignTitle, campaignId, userId, llave_maestra }) {
        try {
            
            const { data: user, error: userError } = await supabase
            .from("usuario")
            .select("llave_maestra")
            .eq("id_usuario", userId)
            .single();
            
            if (userError || !user) throw new Error("Usuario no encontrado");
            if (user.llave_maestra !== llave_maestra) {
                throw new Error("Llave maestra incorrecta. Verifica tus datos antes de continuar.");
            }
            
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
                    success: "https://impulsocfa-front.vercel.app/pago-exitoso",
                    failure: "https://impulsocfa-front.vercel.app/pago-fallido",
                    pending: "https://impulsocfa-front.vercel.app/pago-pendiente",
                    
                },
                notification_url: `https://impulsocfa-back.onrender.com/api/payments/webhook`,
                auto_return: "approved",
                external_reference: JSON.stringify({ campaignId, userId }),
            };

            const response = await preference.create({ body });
            return response.id; // ID de la preferencia
        } catch (error) {
            console.error("Error al crear preferencia:", error);
            throw new Error(error.message);
        }
    }




    static async handleWebhook(paymentId) {
        try {
            const payment = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
            }).then(res => res.json());

            const { status, transaction_amount, payment_method_id, external_reference, id, receipt_url } = payment;
            const { campaignId, userId } = JSON.parse(external_reference);

            // ✅ Solo continuar si el pago fue aprobado
            if (status !== "approved") {
                console.log("⚠️ Pago no aprobado, se ignora.");
                return;
            }

            // ✅ Verificar si el pago ya fue registrado
            const { data: existingPayment } = await supabase
                .from("pago")
                .select("id_pago")
                .eq("codigo_transaccion", id.toString())
                .maybeSingle();

            if (existingPayment) {
                console.log("⚠️ Pago ya registrado");
                return;
            }

            // ✅ crear nueva donación
            const { data: donacion, error: donacionError } = await supabase
                .from("donacion")
                .insert({
                    id_campana: campaignId,
                    id_usuario: userId,
                    monto: transaction_amount,
                })
                .select("id_donacion")
                .single();

            if (donacionError) throw new Error(donacionError.message);
            const donacionId = donacion.id_donacion;

            // ✅ Crear registro de pago
            const receiptUrl = `https://www.mercadopago.com.ar/tools/receipt-view/${id}?origin=activities`;

            const { error: pagoError } = await supabase.from("pago").insert({
                id_donacion: donacionId,
                codigo_transaccion: id.toString(),
                metodo: payment_method_id,
                estado: "aprobado",
                comprobante: receiptUrl,
            });

            if (pagoError) throw new Error(pagoError.message);


            // ✅ Actualizar el monto_actual de la campaña
            const { data: campaignData, error: fetchError } = await supabase
                .from("campana")
                .select("monto_actual")
                .eq("id_campana", campaignId)
                .single();
            
            if (fetchError) throw new Error(fetchError.message);

            const nuevoMonto = Number(campaignData.monto_actual) + Number(transaction_amount);

            const { error: updateError } = await supabase
                .from("campana")
                .update({ monto_actual: nuevoMonto })
                .eq("id_campana", campaignId);
            
            if (updateError) throw new Error(updateError.message);

        } catch (error) {
            console.error("Error en handleWebhook:", error);
            throw error;
        }
    }

    


}

