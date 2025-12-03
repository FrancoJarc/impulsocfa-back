// src/server.js
import 'dotenv/config';
import express from "express";
import cors from "cors";
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import campaignRoutes from './routes/campaign.routes.js';
import adminRoutes from './routes/admin.routes.js';
import userRoutes from './routes/user.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import commentRoutes from './routes/comment.routes.js';
import historyRoutes from './routes/history.routes.js';
import reportRoutes from './routes/report.routes.js';
import { verificarHistoriasJob } from './jobs/verificarHistoriasJob.js';

// Crear servidor
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const corsOptions = {
    origin: ["https://impulsocfa-front.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

app.use(async (req, res, next) => {
    verificarHistoriasJob().catch(console.error);
    next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/reports", reportRoutes);


// Ruta de prueba
app.get('/', (req, res) => res.json({ message: 'Servidor funcionando con Supabase' }));

// Fallback 404 para rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

// Levantar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
