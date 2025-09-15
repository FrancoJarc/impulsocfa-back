import supabase from '../config/supabase.js';

export class AuthService {
    // Servicio para registro con Google
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

        if (!existingUser) {
            const { data: newUser, error: insertError } = await supabase
                .from('usuario')
                .insert([{
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
            return { user, profile: newUser };
        }

        const { data: loginData, error: loginError } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { accessToken: access_token }
        });

        if (loginError) throw new Error(loginError.message);

        const session = loginData.session;

        return {
            user,
            profile,
            access_token: session.access_token,
            refresh_token: session.refresh_token
        };
    }

    // Servicio para registro normal
    static async registerUserService({email,password,nombre,apellido,fecha_nacimiento,foto_perfil = null,nacionalidad}) {
        if (!email || !password || !nombre || !apellido || !nacionalidad) {
            throw new Error('Faltan campos obligatorios');
        }

        if (password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw new Error(authError.message);

        const authUser = authData.user;

        const { data: newUser, error: insertError } = await supabase
            .from('usuario')
            .insert([{
                id_usuario: authUser.id,
                nombre,
                apellido,
                fecha_nacimiento,
                foto_perfil,
                nacionalidad
            }])
            .select()
            .single();

        if (insertError) throw new Error(insertError.message);

        const session = authData.session;

        return {
            message: session
                ? 'Usuario registrado y logueado correctamente'
                : 'Usuario registrado, falta confirmar el correo electrónico',
            user: { id: authUser.id, email: authUser.email },
            profile: newUser,
            access_token: session.access_token,
            refresh_token: session.refresh_token
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

        return {
            message: "Login exitoso",
            user: {
                id: user.id,
                email: user.email
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
