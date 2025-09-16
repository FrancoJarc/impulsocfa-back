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

    // iniciar sesion
    static async loginUser(req, res) {
        try {
            const { email, password } = req.body;
            const result = await AuthService.loginUserService({ email, password });
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }


    //obtener la llave maestra
    static async getLlaveMaestra(req, res) {
        try {
            const userId = req.user.id;
            const result = await AuthService.getLlaveMaestraService(userId);
            return res.status(200).json(result);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
    }



    static async logoutUser(req, res) {
        try {
            const result = await AuthService.logoutUserService();
            return res.status(200).json(result);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
    }



    static async changePassword(req, res) {
        try {
            const userId = req.user.id; // viene del token
            const { llave_maestra, newPassword } = req.body;

            if (!llave_maestra || !newPassword) {
                return res.status(400).json({ error: "Faltan campos obligatorios" });
            }

            const result = await AuthService.changePasswordService(userId, llave_maestra, newPassword);
            return res.status(200).json(result);

        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
    }


    

}
