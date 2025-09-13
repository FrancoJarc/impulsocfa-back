import { CategoryService } from '../services/category.service.js';

export class CategoryController {
    static async createCategory(req, res) {
        try {
            const { nombre } = req.body;
            if (!nombre || nombre.trim() === "") {
                return res.status(400).json({ error: "El nombre de la categoría es obligatorio" });
            }
            const result = await CategoryService.createCategoryService(nombre);
            return res.status(201).json(result);
        } catch (err) {
            console.error(err);
            return res.status(400).json({ error: err.message });
        }
    }

    static async getCategories(req, res) {
        try {
            const result = await CategoryService.getCategoriesService();
            return res.status(200).json(result);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }


    static async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const { nombre } = req.body;
            if (!nombre || nombre.trim() === "") {
                return res.status(400).json({ error: "El nombre de la categoría es obligatorio" });
            }
            const result = await CategoryService.updateCategoryService(id, nombre);
            return res.status(200).json(result);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

    static async deleteCategory(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ error: "ID inválido" });
            }

            const result = await CategoryService.deleteCategoryService(id);

            if (!result || result.length === 0) {
                return res.status(404).json({ error: "Categoría no encontrada" });
            }

            return res.status(200).json({
                message: "Categoría eliminada con éxito",
                categoria: result[0],
            });
        } catch (err) {
            console.error(err);
            return res.status(400).json({ error: err.message });
        }
    }
}
