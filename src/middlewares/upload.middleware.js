import multer from "multer";
import path from "path";

// Configuración básica: guarda el archivo temporalmente en /tmp
const storage = multer.memoryStorage(); // usamos memoria para luego subir a Supabase

// Filtro opcional para solo aceptar imágenes
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Tipo de archivo no permitido. Solo JPG o PNG."), false);
};

export const upload = multer({ storage, fileFilter });
