import supabase from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';



export class AuthService {
 

    static async registerGoogleService(access_token) {
        const { data: userData, error: userError } = await supabase.auth.getUser(access_token);
        if (userError) throw new Error(userError.message);

        const user = userData.user;

        const { data: existingUser } = await supabase
            .from('usuario')
            .select('*')
            .eq('id_usuario', user.id)
            .single();

        let profile = existingUser;
        let isNewUser = false;

        if (!existingUser) {
            const { data: newUser, error: insertError } = await supabase
                .from('usuario')
                .upsert([{
                    id_usuario: user.id,
                    nombre: null,
                    apellido: null,
                    fecha_nacimiento: null,
                    foto_perfil: null,
                    nacionalidad: null
                }])
                .select()
                .single();

            if (insertError) throw new Error(insertError.message);
            profile = newUser;
            isNewUser = true;
        }

        return {
            user,
            profile,
            access_token,
            isNewUser
        };
    }


    static async registerUserService({email,password,nombre,apellido,fecha_nacimiento,nacionalidad}, file) {
        if (!email || !password || !nombre || !apellido || !nacionalidad) {
            throw new Error('Faltan campos obligatorios');
        }

        if (password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: process.env.EMAIL_REDIRECT_URL
            }
        });
        if (authError) throw new Error("Error creando usuario en auth: " + authError.message);

        const authUser = authData.user;

        let foto_perfil_url = null;

        /*if (file) {
            try {
                const fileExt = file.originalname.split(".").pop();
                const fileName = `${uuidv4()}.${fileExt}`;

                console.log("Archivo recibido:", file.originalname, file.mimetype, file.size);

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from("foto_usuarios") 
                    .upload(`perfiles/${fileName}`, file.buffer, {
                        contentType: file.mimetype,
                        upsert: false,
                    });
                console.log("Subida completada:", uploadData);

                if (uploadError) throw new Error("Error subiendo la foto: " + uploadError.message);

                // Obtener URL pública
                const { data: publicUrl } = supabase.storage
                    .from("foto_usuarios")
                    .getPublicUrl(`perfiles/${fileName}`);

                foto_perfil_url = publicUrl.publicUrl;
            } catch (err) {
                throw new Error("Error subiendo la foto de perfil: " + err.message);
            }
        }*/


        const { data: newUser, error: insertError } = await supabase
            .from('usuario')
            .upsert([{
                id_usuario: authUser.id,
                nombre,
                apellido,
                fecha_nacimiento,
                foto_perfil: foto_perfil_url,
                nacionalidad
            }])
            .select()
            .single();

        if (insertError) throw new Error("Error creando usuario en DB: " + insertError.message);


        return {
            message: 'Usuario registrado. Revisa tu correo para confirmar tu cuenta.',
            user: { id: authUser.id, email: authUser.email },
            profile: newUser
        };
    }




    static async loginUserService({ email, password }) {
        if (!email || !password) {
            throw new Error("Email y contraseña son obligatorios");
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            throw new Error(error.message);
        }

        const { user, session } = data;

        if (!session) throw new Error("No se pudo iniciar sesión. Verifica tus credenciales");
              
        const { data: profileData, error: profileError } = await supabase
            .from("usuario")
            .select("*")
            .eq("id_usuario", user.id)
            .single();  

        if (profileError) {
            throw new Error("Error obteniendo perfil del usuario");
        }


        return {
            message: "Login exitoso",
            user: {
                id: user.id,
                email: user.email,
                ...profileData
            },
            access_token: session.access_token,
            refresh_token: session.refresh_token
        };
    }



    static async getLlaveMaestraService(userId) {
        if (!userId) {
            throw new Error("Se requiere el ID del usuario");
        }

        const { data, error } = await supabase
            .from('usuario')
            .select('llave_maestra')
            .eq('id_usuario', userId)
            .single();

        if (error) throw new Error(error.message);

        return { llave_maestra: data.llave_maestra };
    }



    static async logoutUserService() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw new Error(error.message);

            return { message: "Sesión cerrada correctamente" };
        } catch (err) {
            throw new Error("Error al cerrar sesión: " + err.message);
        }
    }



    static async changePasswordService(userId, llave_maestra, newPassword) {
        // 1. Buscar usuario en la tabla
        const { data: userRecord, error: dbError } = await supabase
            .from("usuario")
            .select("llave_maestra")
            .eq("id_usuario", userId)
            .single();

        if (dbError || !userRecord) {
            throw new Error("Usuario no encontrado");
        }

        // 2. Validar llave maestra
        if (userRecord.llave_maestra !== llave_maestra) {
            throw new Error("La llave maestra es incorrecta");
        }

        // 3. Validar nueva contraseña
        if (newPassword.length < 6) {
            throw new Error("La contraseña debe tener al menos 6 caracteres");
        }

        // 4. Actualizar contraseña en Supabase Auth
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            throw new Error(error.message);
        }

        return { message: "Contraseña actualizada correctamente" };
    }

}
