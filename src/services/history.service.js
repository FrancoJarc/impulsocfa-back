import supabase from "../config/supabase.js";
import supabaseAdmin from "../config/supabaseAdmin.js";
import { v4 as uuidv4 } from "uuid";

export class HistoryService {

    static async uploadFileToStorage(file) {
        if (!file) return null;

        const fileName = `${Date.now()}-${file.originalname}`;

        const { error } = await supabaseAdmin.storage
            .from("historia_bucket")
            .upload(fileName, file.buffer, {
                contentType: file.mimetype
            });

        if (error) {
            console.error("Supabase upload error:", error);
            throw new Error("Error subiendo archivo");
        }

        const { data: publicUrl } = supabaseAdmin
            .storage
            .from("historia_bucket")
            .getPublicUrl(fileName);

        return publicUrl.publicUrl;
    }


    static async createHistoryService(data) {
        const { id_usuario, titulo, contenido, id_campana, files } = data;

        if (!titulo || !contenido || !id_campana) {
            throw new Error("Faltan campos obligatorios");
        }

        const archivo1 = files?.archivo1 ? await this.uploadFileToStorage(files.archivo1[0]) : null;
        const archivo2 = files?.archivo2 ? await this.uploadFileToStorage(files.archivo2[0]) : null;
        const archivo3 = files?.archivo3 ? await this.uploadFileToStorage(files.archivo3[0]) : null;

        const { data: inserted, error } = await supabase
            .from("historia")
            .insert([{
                id_usuario,
                id_campana,
                titulo,
                contenido,
                archivo1,
                archivo2,
                archivo3,
            }])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return inserted;
    }

    static async getAllHistoriesService() {
        const { data, error } = await supabase.from("historia").select("*");
        if (error) throw new Error(error.message);
        return data;
    }

    static async getHistoryWithCampaignService(id) {
        const { data, error } = await supabase
            .from("historia")
            .select(`
                *,
                campana(*)
            `)
            .eq("id_historia", id)
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

  
    static async updateHistoryService(id_historia, updateData, files) {
        const { data: current, error: fetchError } = await supabase
            .from("historia")
            .select("archivo1, archivo2, archivo3")
            .eq("id_historia", id_historia)
            .single();

        if (fetchError) throw new Error(fetchError.message);

        const finalData = { ...updateData };

        for (const key of ["archivo1", "archivo2", "archivo3"]) {
            if (files?.[key]) {
                // borrar archivo anterior
                if (current[key]) {
                    try {
                        const url = current[key];
                        const cleanUrl = url.split("?")[0];
                        let fileName = cleanUrl.split("/").pop();
                        fileName = decodeURIComponent(fileName);
                        await supabaseAdmin.storage.from("historia_bucket").remove([fileName]);
                    } catch { }
                }

                const uploaded = await this.uploadFileToStorage(files[key][0]);
                finalData[key] = uploaded;
            }
        }

        const { data, error } = await supabase
            .from("historia")
            .update(finalData)
            .eq("id_historia", id_historia)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    static async deleteHistoryService(id_historia) {
        const { data: history, error: fetchError } = await supabase
            .from("historia")
            .select("archivo1, archivo2, archivo3")
            .eq("id_historia", id_historia)
            .single();

        if (fetchError) throw new Error("Historia no encontrada");

        const bucket = "historia_bucket";

        for (const key of ["archivo1", "archivo2", "archivo3"]) {
            if (history[key]) {
                try {
                    const url = history[key];
                    const cleanUrl = url.split("?")[0];
                    let fileName = cleanUrl.split("/").pop();
                    fileName = decodeURIComponent(fileName);
                    await supabaseAdmin.storage
                        .from(bucket)
                        .remove([fileName]);
                } catch (err) {
                    console.error("Error al borrar archivo:", err.message);
                }
            }
        }

        const { error } = await supabase
            .from("historia")
            .delete()
            .eq("id_historia", id_historia);

        if (error) throw new Error(error.message);

        return true;
    }

}
