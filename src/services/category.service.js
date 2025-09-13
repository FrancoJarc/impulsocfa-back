import supabase from '../config/supabase.js';

export class CategoryService {
    static async createCategoryService(nombre) {
        if (!nombre) throw new Error("El nombre es obligatorio");

        const { data, error } = await supabase
            .from('categoria')
            .insert([{ nombre }])
            .select()
            .single();

        if (error) throw new Error(error.message);

        return data;
    }

    static async getCategoriesService() {
        const { data, error } = await supabase.from('categoria').select('*');
        if (error) throw new Error(error.message);

        return data;
    }


    static async updateCategoryService(id_categoria, nombre) {
        const { data, error } = await supabase
            .from('categoria')
            .update({ nombre })
            .eq('id_categoria', id_categoria)
            .select()
            .single();

        if (error) throw new Error(error.message);

        return data;
    }

    static async deleteCategoryService(id_categoria) {
        const { data, error } = await supabase
            .from('categoria')
            .delete()
            .eq('id_categoria', id_categoria)
            .select(); // trae las filas eliminadas

        if (error) throw new Error(error.message);

        return data;
    }
}
