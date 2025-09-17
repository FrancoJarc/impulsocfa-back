import supabase from '../config/supabase.js';

export async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: "No se proporcionó token" });
        }

        const token = authHeader.split(" ")[1]; 
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            return res.status(401).json({ error: "Token inválido" });
        }

        const authUser = data.user;

        const { data: userData, error: dbError } = await supabase
            .from('usuario')
            .select('id_usuario, rol')
            .eq('id_usuario', authUser.id)
            .single();

        if (dbError || !userData) { 
            return res.status(401).json({ error: "Usuario no encontrado en la DB" });
        }

        req.user = {
            id: authUser.id,
            email: authUser.email,
            rol: userData.rol,
        };
        next();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error de autenticación" });
    }
}