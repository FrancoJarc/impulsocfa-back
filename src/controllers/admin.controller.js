import { AdminService } from '../services/admin.service.js';

export class AdminController {
    static async createAdmin(req, res) {
        try {
            const { email, password, nombre, apellido, fecha_nacimiento, foto_perfil, nacionalidad } = req.body;
            const admin = await AdminService.createAdminService({ email, password, nombre, apellido, fecha_nacimiento, foto_perfil, nacionalidad });
            return res.status(201).json(admin);
        } catch (err) {
            console.error(err);
            return res.status(400).json({ error: err.message });
        }
    }

    static async updateAdmin(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedAdmin = await AdminService.updateAdminService(id, updateData);
            return res.status(200).json(updatedAdmin);
        } catch (err) {
            console.error(err);
            return res.status(400).json({ error: err.message });
        }
    }

    static async deleteAdmin(req, res) {
        try {
            const { id } = req.params;
            await AdminService.disableAdminService(id);
            return res.status(200).json({ message: "Administrador deshabilitado correctamente" });
        } catch (err) {
            console.error(err);
            return res.status(400).json({ error: err.message });
        }
    }

    static async changeUserState(req, res) {
        try {
            const { id } = req.params;
            const { estado_cuenta } = req.body;
            const updatedUser = await AdminService.changeUserStateService(id, estado_cuenta);
            return res.status(200).json(updatedUser);
        } catch (err) {
            console.error(err);
            return res.status(400).json({ error: err.message });
        }
    }

    static async getAdmins(req, res) {
        try {
            const admins = await AdminService.getAdminsService();
            return res.status(200).json(admins);
        } catch (err) {
            console.error(err);
            return res.status(400).json({ error: err.message });
        }
    }

    static async getUsers(req, res) {
        try {
            const users = await AdminService.getUsersService();
            return res.status(200).json(users);
        } catch (err) {
            console.error(err);
            return res.status(400).json({ error: err.message });
        }
    }
}
