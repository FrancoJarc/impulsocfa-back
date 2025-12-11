// src/jobs/verificarHistoriasJob.js
import supabase from "../config/supabase.js";

export async function verificarHistoriasJob() {
    try {
        // 1. Buscar historias del 100% vencidas y no verificadas
        const { data: historias, error } = await supabase
            .from("historia")
            .select("id_historia, id_usuario, id_campana, fecha_limite")
            .eq("tipo", "verificacion_100")
            .eq("verificado", false)

        if (error) throw error;

        const ahora = new Date();

        for (const h of historias) {
            const estaVencida = h.fecha_limite && new Date(h.fecha_limite) < ahora;

            if (estaVencida) {
                // 2. Suspender al usuario
                await supabase
                    .from("usuario")
                    .update({ estado_cuenta: "suspendida" })
                    .eq("id_usuario", h.id_usuario);

                // 3. Suspender sus campañas activas
                await supabase
                    .from("campana")
                    .update({ estado: "suspendida" })
                    .eq("id_usuario", h.id_usuario)
                    .eq("estado", "aprobada");

                // 4. Marcar historia como verificada
                await supabase
                    .from("historia")
                    .update({ verificado: true })
                    .eq("id_historia", h.id_historia);

                console.log(`Usuario ${h.id_usuario} suspendido por no subir historia final`);

            }
        }
    } catch (err) {
        console.error("Error en verificarHistoriasJob:", err);
    }
}
