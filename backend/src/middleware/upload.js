// backend/src/middleware/upload.js
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Storage: /uploads/fecha-nombre.ext
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  // para debug: ver exactamente qué mimetype está llegando
  console.log("Subiendo archivo:", file.originalname, file.mimetype);

  const allowed = [
    "image/jpeg",
    "image/jpg",    // algunas cámaras usan image/jpg
    "image/png",
    "image/webp",
    "image/heic",   // típicas fotos de iPhone
    "image/heif",
    "image/avif",
    "image/pjpeg",
    "image/jfif",
  ];

  const ok = allowed.includes(file.mimetype);
  cb(ok ? null : new Error("Tipo de archivo no permitido"), ok);
}

export const multerPhotos = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // 5MB, máx 5
});

export const uploadPhotos = multerPhotos.array("photos", 5);
