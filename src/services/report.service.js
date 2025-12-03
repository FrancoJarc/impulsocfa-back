import supabase from "../config/supabase.js";

export class ReportService {

    static async createReporteService(data) {
        const { id_usuario, id_campana, motivo } = data;

        if (!id_usuario || !id_campana || !motivo) {
            throw new Error("Faltan campos obligatorios");
        }

        const { data: inserted, error } = await supabase
            .from("reporte")
            .insert([{
                id_usuario,
                id_campana,
                motivo
            }])
            .select()
            .single();

        if (error) throw new Error(error.message);

        return inserted;
    }

    static async getAllReportesService() {
        const { data, error } = await supabase
            .from("reporte")
            .select(`
                *,
                usuario(*),
                campana(*)
            `);

        if (error) throw new Error(error.message);

        return data;
    }

    static async getReporteByIdService(id_reporte) {
        const { data, error } = await supabase
            .from("reporte")
            .select(`
                *,
                usuario(*),
                campana(*)
            `)
            .eq("id_reporte", id_reporte)
            .single();

        if (error) throw new Error(error.message);

        return data;
    }

    static async updateReporteService(id_reporte, updateData) {
        const { data, error } = await supabase
            .from("reporte")
            .update(updateData)
            .eq("id_reporte", id_reporte)
            .select()
            .single();

        if (error) throw new Error(error.message);

        return data;
    }

    static async deleteReporteService(id_reporte) {
        const { error } = await supabase
            .from("reporte")
            .delete()
            .eq("id_reporte", id_reporte);

        if (error) throw new Error(error.message);

        return true;
    }
}
