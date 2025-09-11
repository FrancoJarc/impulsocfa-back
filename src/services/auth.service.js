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

        return { user, profile: existingUser };
    }

    // Servicio para registro normal
    static async registerUserService({
        email,
        password,
        nombre,
        apellido,
        fecha_nacimiento,
        foto_perfil = null,
        nacionalidad
    }) {
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

        return {
            message: 'Usuario registrado correctamente',
            user: { id: authUser.id, email: authUser.email },
            profile: newUser
        };
    }
}
