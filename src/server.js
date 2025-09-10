// src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";


// Configuración de variables de entorno
dotenv.config();

// Crear servidor
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Inicializar cliente de Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Ruta de prueba
app.get("/", async (req, res) => {
    try {
        // Hacer una query de prueba a una tabla llamada 'usuarios'
        const { data, error } = await supabase
            .from("usuario") // nombre de tu tabla en Supabase
            .select("*");

        if (error) throw error;

        res.json({
            message: "Servidor funcionando con Supabase",
            usuario: data,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error consultando Supabase" });
    }
});

// Levantar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
