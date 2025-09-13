export function authorization(...rolesPermitidos) {
    return (req, res, next) => {
        const { rol } = req.user;

        if (!rol) {
            return res.status(401).json({ error: "Usuario no autenticado" });
        }

        if (!rolesPermitidos.includes(rol)) {
            return res.status(403).json({ error: "No tenés acceso a este recurso" });
        }

        next();
    };
}
