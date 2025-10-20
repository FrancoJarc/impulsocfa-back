import supabase from '../config/supabase.js';
import supabaseAdmin from '../config/supabaseAdmin.js';

export class CampaignService {

    static async uploadImageToStorage(file) {
        if (!file) return null;

        const fileName = `${Date.now()}-${file.originalname}`;
        const { error } = await supabaseAdmin.storage
            .from("campaign-photos")
            .upload(fileName, file.buffer, { contentType: file.mimetype });

        if (error) {
            console.error("Supabase upload error:", error);
            throw new Error("Error subiendo la imagen");
        }

        const { data: publicUrl } = supabaseAdmin
            .storage
            .from("campaign-photos")
            .getPublicUrl(fileName);

        return publicUrl.publicUrl;
    }

    // Crear campaña
    static async createCampaignService(campaignData) {
        const { id_usuario, id_categoria, titulo, descripcion, tiempo_objetivo, monto_objetivo, file } = campaignData;

        if (!id_categoria || !titulo || !descripcion || !monto_objetivo || !tiempo_objetivo || !file) {
            throw new Error("Todos los campos son obligatorios");
        }

        // Validar categoría
        const { data: categoria, error: catError } = await supabase
            .from('categoria')
            .select('*')
            .eq('id_categoria', id_categoria)
            .single();

        if (!categoria || catError) throw new Error("Categoría inválida");

        const foto_principal = await this.uploadImageToStorage(file);

        const { data, error } = await supabase
            .from('campana')
            .insert([{
                id_usuario,
                id_categoria,
                titulo,
                descripcion,
                foto_principal: foto_principal || null,
                tiempo_objetivo,
                monto_objetivo,
                monto_actual: 0,
                estado: 'pendiente' // siempre pendiente al crear
            }])
            .select()
            .single();

        if (error) throw new Error(error.message);

        return data;
    }

    // Listar campañas (solo aprobadas)
    static async getCampaignsService(filters = {}) {
        let query = supabase.from('campana').select('*').eq('estado', 'aprobada');

        if (filters.id_categoria) query = query.eq('id_categoria', filters.id_categoria);
        if (filters.id_usuario) query = query.eq('id_usuario', filters.id_usuario);

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        return data;
    }

    // Obtener campaña por ID
    static async getCampaignByIdService(id_campana) {
        const { data, error } = await supabase
            .from('campana')
            .select('*')
            .eq('id_campana', id_campana)
            .single();

        if (error) throw new Error(error.message);

        return data;
    }

    // Verificar si la campaña tiene donaciones
    static async hasDonations(id_campana) {
        const { data, error } = await supabase
            .from('donacion')
            .select('*')
            .eq('id_campana', id_campana);

        if (error) throw new Error(error.message);

        return data.length > 0;
    }

    // Editar campaña
    static async updateCampaignService(id_campana, campaignData, file) {
        // 1️⃣ Obtener la campaña actual (para conocer la imagen vieja)
        const { data: currentCampaign, error: fetchError } = await supabase
            .from('campana')
            .select('foto_principal')
            .eq('id_campana', id_campana)
            .single();

        if (fetchError) throw new Error(fetchError.message);

        let updateData = { ...campaignData };

        // 2️⃣ Si hay nueva imagen, borrar la vieja y subir la nueva
        if (file) {
            // Si existe imagen anterior, eliminarla del bucket
            if (currentCampaign?.foto_principal) {
                try {
                    const oldPath = currentCampaign.foto_principal.split('/').pop(); // obtener nombre del archivo
                    await supabaseAdmin.storage.from('campaign-photos').remove([oldPath]);
                } catch (err) {
                    console.warn("No se pudo eliminar la imagen anterior:", err.message);
                }
            }

            // Subir la nueva imagen
            const newImageUrl = await this.uploadImageToStorage(file);
            updateData.foto_principal = newImageUrl;
        }

        // 3️⃣ Actualizar la campaña
        const { data, error } = await supabase
            .from('campana')
            .update(updateData)
            .eq('id_campana', id_campana)
            .select()
            .single();

        if (error) throw new Error(error.message);

        return data;
    }

    // Suspender campaña
    static async suspendCampaignService(id_campana) {
        const { data, error } = await supabase
            .from('campana')
            .update({ estado: 'suspendida' })
            .eq('id_campana', id_campana)
            .select()
            .single();

        if (error) throw new Error(error.message);

        return data;
    }

    // Aprobar/Rechazar campaña
    static async approveCampaignService(id_campana, estado) {
        if (!['aprobada', 'rechazada'].includes(estado)) {
            throw new Error("Estado inválido");
        }

        const { data, error } = await supabase
            .from('campana')
            .update({ estado })
            .eq('id_campana', id_campana)
            .select()
            .single();

        if (error) throw new Error(error.message);

        return data;
    }


    // Para filtrar por campañas pendientes
    static async getPendingCampaignsService() {
        const { data, error } = await supabase
            .from('campana')
            .select('*')
            .eq('estado', 'pendiente');

        if (error) throw new Error(error.message);
        return data;
    }
}
