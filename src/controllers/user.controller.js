import { UserService } from "../services/user.service.js";

export class UserController {
    static async updateUser(req, res) {
        try {
            const id_usuario = req.user.id; // viene del token
            const updatedUser = await UserService.updateUserService(id_usuario, req.body, req.file);
            return res.status(200).json(updatedUser);
        } catch (err) {
            console.error(err);
            return res.status(400).json({ error: err.message });
        }
    }


    static async disableAccount(req, res) {
        try {
            const id_usuario = req.user.id; // viene del token
            const disableUser = await UserService.disableAccountService(id_usuario);
            return res.status(200).json(disableUser);
        } catch (err) {
            console.error(err);
            return res.status(400).json({ error: err.message });
        }
    }
}
