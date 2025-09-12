import supabase from '../config/supabase.js';

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: "No se proporcionó token" });
        }

        const token = authHeader.split(" ")[1]; // Bearer <token>

        // Validar token con Supabase
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            return res.status(401).json({ error: "Token inválido" });
        }

        req.user = data.user; // Guardamos la info del usuario para usarla en la ruta
        next();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error de autenticación" });
    }
};
