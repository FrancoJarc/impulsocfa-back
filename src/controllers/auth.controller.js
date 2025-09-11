import { AuthService } from '../services/auth.service.js';

export class AuthController {
    //Registro con google
    static async registerGoogle(req, res) {
        try {
            const { access_token } = req.body;
            if (!access_token) return res.status(400).json({ error: 'No se envió el access_token' });

            const result = await AuthService.registerGoogleService(access_token);
            return res.json(result);

        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error en login con Google' });
        }
    }

    // Registro normal con email/password
    static async registerUser(req, res) {
        try {
            const result = await AuthService.registerUserService(req.body);
            return res.json(result);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
    }
}
