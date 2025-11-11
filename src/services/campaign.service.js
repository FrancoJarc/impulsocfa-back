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
        const { id_usuario, id_categoria, titulo, descripcion, tiempo_objetivo, monto_objetivo,alias, llave_maestra, files } = campaignData;

        if (!id_categoria || !titulo || !descripcion || !monto_objetivo || !tiempo_objetivo || !alias || !llave_maestra || !files) {
            throw new Error("Todos los campos son obligatorios");
        }

        const { data: user, error: userError } = await supabase
            .from("usuario")
            .select("llave_maestra")
            .eq("id_usuario", id_usuario)
            .single();

        if (userError || !user) throw new Error("Usuario no encontrado");
        if (user.llave_maestra !== llave_maestra) throw new Error("Llave maestra incorrecta");

        // Validar categoría
        const { data: categoria, error: catError } = await supabase
            .from('categoria')
            .select('*')
            .eq('id_categoria', id_categoria)
            .single();

        if (!categoria || catError) throw new Error("Categoría inválida");

        const foto1 = files?.foto1 ? await this.uploadImageToStorage(files.foto1[0]) : null;
        const foto2 = files?.foto2 ? await this.uploadImageToStorage(files.foto2[0]) : null;
        const foto3 = files?.foto3 ? await this.uploadImageToStorage(files.foto3[0]) : null;

        const { data, error } = await supabase
            .from('campana')
            .insert([{
                id_usuario,
                id_categoria,
                titulo,
                descripcion,
                foto1,
                foto2,
                foto3,
                tiempo_objetivo,
                monto_objetivo,
                monto_actual: 0,
                alias,
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

        if (filters.q && filters.q.length >= 3) {
            query = query.ilike('titulo', `%${filters.q}%`);
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        return data;
    }

    // Obtener campaña por ID
    static async getCampaignByIdService(id_campana) {
        const { data: campaign, error: fetchError } = await supabase
            .from('campana')
            .select('*')
            .eq('id_campana', id_campana)
            .single();

        if (fetchError) throw new Error(fetchError.message);

        // 2️⃣ Verificar si tiene donaciones
        const { data: donations, error: donationsError } = await supabase
            .from('donacion')
            .select('id_donacion')
            .eq('id_campana', id_campana);

        if (donationsError) throw new Error(donationsError.message);

        return {
            ...campaign,
            hasDonations: donations.length > 0,
        };
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
    static async updateCampaignService(id_campana, campaignData, files) {
        // 1️⃣ Obtener la campaña actual (para conocer la imagen vieja)
        const { data: currentCampaign, error: fetchError } = await supabase
            .from('campana')
            .select('foto1, foto2, foto3')
            .eq('id_campana', id_campana)
            .single();

        if (fetchError) throw new Error(fetchError.message);

        let updateData = { ...campaignData };

        // 🟩 Procesar actualización de fotos (hasta 3)        for (const key of ['foto1', 'foto2', 'foto3']) {
        for (const key of ['foto1', 'foto2', 'foto3']) {
            if (files?.[key]) {
                // Borrar imagen vieja si existe
                if (currentCampaign?.[key]) {
                    try {
                        const oldPath = currentCampaign[key].split('/').pop();
                        await supabaseAdmin.storage.from('campaign-photos').remove([oldPath]);
                    } catch (err) {
                        console.warn(`No se pudo eliminar ${key} anterior:`, err.message);
                    }
                }

                // Subir nueva imagen
                const newImageUrl = await this.uploadImageToStorage(files[key][0]);
                updateData[key] = newImageUrl;
            }
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


    // Para filtrar por campañas pendientes del usuario logueado
    static async getUserPendingCampaignsService(id_usuario) {
        const { data, error } = await supabase
            .from('campana')
            .select('*')
            .eq('estado', 'pendiente')
            .eq('id_usuario', id_usuario);

        if (error) throw new Error(error.message);

        return data;
    }



    static async getUserRejectedCampaignsService(id_usuario) {
        const { data, error } = await supabase
            .from('campana')
            .select('*')
            .eq('estado', 'rechazada')
            .eq('id_usuario', id_usuario);

        if (error) throw new Error(error.message);

        return data;
    }



    static async getDonationsByCampaignId(id) {
        const { data, error } = await supabase
            .from('donacion')
            .select(`
                id_donacion,
                monto,
                fecha,
                id_usuario,
                usuario (
                    nombre,
                    apellido,
                    foto_perfil
                )
            `)
            .eq('id_campana', id)
            .order('fecha', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    }



    static async getLatestDonationsByCampaign(id) {
        const { data, error } = await supabase
            .from('donacion')
            .select(`
                id_donacion,
                monto,
                fecha,
                usuario (
                    nombre,
                    apellido,
                    foto_perfil
                )
            `)
            .eq('id_campana', id)
            .order('fecha', { ascending: false })
            .limit(3);

        if (error) throw new Error(error.message);
        return data;
    }


}
