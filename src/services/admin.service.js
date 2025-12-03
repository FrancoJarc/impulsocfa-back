import supabase from '../config/supabase.js';

export class AdminService {
    // Crear un nuevo administrador (auth + registro en tabla usuario)
    static async createAdminService({ email, password, nombre, apellido}) {
        if (!email || !password || !nombre || !apellido) {
            throw new Error('Faltan campos obligatorios');
        }

        if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');

        // Crear usuario en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password
        });
        if (authError) throw new Error(authError.message);

        const authUser = authData.user;

        // Crear perfil en tabla usuario
        const { data: newAdmin, error: insertError } = await supabase
            .from('usuario')
            .upsert([{
                id_usuario: authUser.id,
                nombre,
                apellido,
                rol: 'administrador',
                estado_cuenta: 'habilitada'
            }])
            .select()
            .single();

        if (insertError) throw new Error(insertError.message);

        return {
            message: 'Administrador creado correctamente',
            admin: newAdmin
        };
    }

    // Editar datos de un administrador
    static async updateAdminService(id_usuario, updateData) {
        const { data: admin, error: getError } = await supabase
            .from('usuario')
            .select('*')
            .eq('id_usuario', id_usuario)
            .single();

        if (getError || !admin) throw new Error('Administrador no encontrado');
        if (admin.rol !== 'administrador') throw new Error('Solo se pueden editar administradores');

        const { data, error } = await supabase
            .from('usuario')
            .update(updateData)
            .eq('id_usuario', id_usuario)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    // “Eliminar” (deshabilitar) administrador
    static async disableAdminService(id_usuario) {
        const { data: admin, error: getError } = await supabase
            .from('usuario')
            .select('*')
            .eq('id_usuario', id_usuario)
            .single();

        if (getError || !admin) throw new Error('Administrador no encontrado');
        if (admin.rol !== 'administrador') throw new Error('Solo se pueden deshabilitar administradores');

        const { error } = await supabase
            .from('usuario')
            .update({ estado_cuenta: 'deshabilitada' })
            .eq('id_usuario', id_usuario);

        if (error) throw new Error(error.message);
    }

    // Cambiar estado de cuenta de usuarios comunes
    static async changeUserStateService(id_usuario, estado_cuenta) {
        if (!['habilitada', 'deshabilitada', 'suspendida'].includes(estado_cuenta)) {
            throw new Error('Estado de cuenta inválido');
        }

        const { data: user, error: getError } = await supabase
            .from('usuario')
            .select('*')
            .eq('id_usuario', id_usuario)
            .single();

        if (getError || !user) throw new Error('Usuario no encontrado');
        if (user.rol !== 'usuario') throw new Error('Solo se puede cambiar el estado de usuarios normales');

        const { data, error } = await supabase
            .from('usuario')
            .update({ estado_cuenta })
            .eq('id_usuario', id_usuario)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    // Obtener todos los administradores
    static async getAdminsService() {
        const { data, error } = await supabase
            .from('usuario')
            .select('*')
            .eq('rol', 'administrador');

        if (error) throw new Error(error.message);
        return data;
    }

    // Obtener todos los usuarios comunes
    static async getUsersService() {
        const { data, error } = await supabase
            .from('usuario')
            .select('*')
            .eq('rol', 'usuario');

        if (error) throw new Error(error.message);
        return data;
    }
}
