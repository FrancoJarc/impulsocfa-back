import { ComentarioService } from "../services/comment.service.js";

export class ComentarioController {
    static async createComentario(req, res) {
        try {
            const { id_campana, contenido } = req.body;
            const id_usuario = req.user.id;
            const comentario = await ComentarioService.createComentario({ id_usuario, id_campana, contenido });
            return res.status(201).json(comentario);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async getComentariosByCampana(req, res) {
        try {
            const { id_campana } = req.params;
            const comentarios = await ComentarioService.getComentariosByCampana(id_campana);
            return res.status(200).json(comentarios);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async updateComentario(req, res) {
        try {
            const { id_comentario } = req.params;
            const id_usuario = req.user.id;
            const { contenido } = req.body;
            const updated = await ComentarioService.updateComentario({ id_comentario, id_usuario, contenido });
            return res.status(200).json(updated);
        } catch (error) {
            return res.status(403).json({ error: error.message });
        }
    }

    static async deleteComentario(req, res) {
        try {
            const { id_comentario } = req.params;
            const id_usuario = req.user.id;
            const result = await ComentarioService.deleteComentario({ id_comentario, id_usuario });
            return res.status(200).json(result);
        } catch (error) {
            return res.status(403).json({ error: error.message });
        }
    }
}

