// middlewares/uploadMedia.middleware.js
import multer from "multer";

const storage = multer.memoryStorage();

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "video/mp4",
    "video/quicktime", // mov
    "video/x-matroska", // mkv
    "video/x-msvideo" // avi
];

const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Tipo de archivo no permitido (solo imágenes o videos)."), false);
    }
};

export const uploadMedia = multer({ storage, fileFilter });
