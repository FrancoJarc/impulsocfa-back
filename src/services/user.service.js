import supabase from "../config/supabase.js";
import { v4 as uuidv4 } from "uuid";
import supabaseAdmin from "../config/supabaseAdmin.js";

export class UserService {
    static async updateUserService(id_usuario, userData, file) {
        let foto_perfil_url;

        const { data: existingUser, error: existingError } = await supabase
            .from("usuario")
            .select("foto_perfil")
            .eq("id_usuario", id_usuario)
            .single();

        if (existingError) throw new Error("Error obteniendo usuario actual");

        foto_perfil_url = existingUser?.foto_perfil;
        
        // Si el usuario sube una nueva imagen
        if (file) {
            try {
                const fileExt = file.originalname.split(".").pop();
                const fileName = `${uuidv4()}.${fileExt}`;

                const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
                    .from("foto_usuarios")
                    .upload(`perfiles/${fileName}`, file.buffer, {
                        contentType: file.mimetype,
                        upsert: false,
                    });

                if (uploadError) throw new Error(uploadError.message);

                const { data: publicUrl } = supabase.storage
                    .from("foto_usuarios")
                    .getPublicUrl(`perfiles/${fileName}`);

                foto_perfil_url = publicUrl.publicUrl;
            } catch (err) {
                throw new Error("Error subiendo la nueva foto: " + err.message);
            }
        }

        const { data, error } = await supabase
            .from("usuario")
            .update({
                nombre: userData.nombre,
                apellido: userData.apellido,
                fecha_nacimiento: userData.fecha_nacimiento,
                nacionalidad: userData.nacionalidad,
                foto_perfil: foto_perfil_url,
            })
            .eq("id_usuario", id_usuario)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }



    static async disableAccountService(id_usuario) {
        const { data, error } = await supabase
            .from("usuario")
            .update({
                estado_cuenta: "deshabilitada",
            })
            .eq("id_usuario", id_usuario)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }


    static async getTotalDonacionesUsuario(id_usuario) {
        const { data, error } = await supabase
            .from("donacion")
            .select("monto, campana!inner(id_usuario)")
            .eq("campana.id_usuario", id_usuario);

        if (error) throw new Error(error.message);

        const total = data.reduce((acc, d) => acc + Number(d.monto), 0);
        return total;
    }

    // Total recaudado en una campaña específica
    static async getTotalDonacionesCampana(id_usuario, id_campana) {
        const { data, error } = await supabase
            .from("donacion")
            .select("monto, campana!inner(id_usuario)")
            .eq("campana.id_usuario", id_usuario)
            .eq("id_campana", id_campana);

        if (error) throw new Error(error.message);

        const total = data.reduce((acc, d) => acc + Number(d.monto), 0);
        return total;
    }

    


}
