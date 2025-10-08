// src/server.js
import 'dotenv/config';
import express from "express";
import cors from "cors";
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import campaignRoutes from './routes/campaign.routes.js';
import adminRoutes from './routes/admin.routes.js';

// Crear servidor
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());


// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/admin', adminRoutes);

// Ruta de prueba
app.get('/', (req, res) => res.json({ message: 'Servidor funcionando con Supabase' }));

// Levantar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
