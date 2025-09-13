import supabase from '../config/supabase.js';

export class CampaignService {
    // Crear campaña
    static async createCampaignService(campaignData) {
        const { id_usuario, id_categoria, titulo, descripcion, foto_principal, tiempo_objetivo, monto_objetivo, fecha_inicio } = campaignData;

        if (!id_categoria || !titulo || !descripcion || !monto_objetivo || !tiempo_objetivo || !fecha_inicio) {
            throw new Error("Faltan datos obligatorios");
        }

        // Validar categoría
        const { data: categoria, error: catError } = await supabase
            .from('categoria')
            .select('*')
            .eq('id_categoria', id_categoria)
            .single();

        if (!categoria || catError) throw new Error("Categoría inválida");

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
                fecha_inicio,
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
    static async updateCampaignService(id_campana, campaignData) {
        const { data, error } = await supabase
            .from('campana')
            .update(campaignData)
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
}
