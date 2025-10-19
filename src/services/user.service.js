import supabase from "../config/supabase.js";
import { v4 as uuidv4 } from "uuid";
import supabaseAdmin from "../config/supabaseAdmin.js";

export class UserService {
    static async updateUserService(id_usuario, userData, file) {
        let foto_perfil_url = userData.foto_perfil || null;

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
}
