import supabase from '../config/supabase.js';

 export class ComentarioService {
     static async createComentario({ id_usuario, id_campana, contenido }) {
         if (!id_usuario || !id_campana || !contenido) {
            throw new Error("Faltan campos obligatorios");
        }

        const { data, error } = await supabase
            .from("comentario")
            .insert([{ id_usuario, id_campana, contenido }])
            .select(`
                id_comentario,
                contenido,
                fecha,
                usuario (
                    nombre,
                    apellido,
                    foto_perfil
                )
            `)
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    static async getComentariosByCampana(id_campana) {
        const { data, error } = await supabase
            .from("comentario")
            .select(`
                id_comentario,
                contenido,
                fecha,
                id_usuario,
                usuario (
                    nombre,
                    apellido,
                    foto_perfil
                )
            `)
            .eq("id_campana", id_campana)
            .order("fecha", { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    }

     static async updateComentario({ id_comentario, id_usuario, contenido }) {
        // Primero, verificar que el comentario pertenece al usuario
        const { data: existing, error: fetchError } = await supabase
            .from("comentario")
            .select("id_usuario")
            .eq("id_comentario", id_comentario)
            .single();

        if (fetchError) throw new Error("Comentario no encontrado");
         if (existing.id_usuario !== id_usuario) {
            throw new Error("No tienes permiso para editar este comentario");
        }

        const { data, error } = await supabase
            .from("comentario")
            .update({ contenido })
            .eq("id_comentario", id_comentario)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

     static async deleteComentario({ id_comentario, id_usuario }) {
        const { data: existing, error: fetchError } = await supabase
            .from("comentario")
            .select("id_usuario")
            .eq("id_comentario", id_comentario)
            .single();

        if (fetchError) throw new Error("Comentario no encontrado");
         if (existing.id_usuario !== id_usuario) {
            throw new Error("No tienes permiso para eliminar este comentario");
        }

        const { error } = await supabase
            .from("comentario")
            .delete()
            .eq("id_comentario", id_comentario);

        if (error) throw new Error(error.message);

        return { message: "Comentario eliminado correctamente" };
    }
}

