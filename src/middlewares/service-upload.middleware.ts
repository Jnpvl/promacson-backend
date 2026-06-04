import fs from "fs";
import path from "path";
import multer from "multer";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "services");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const safeExt = [".jpg", ".jpeg", ".png", ".webp"].includes(ext) ? ext : ".jpg";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export const serviceImageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      cb(new Error("Solo se permiten imágenes JPG, PNG o WebP"));
      return;
    }
    cb(null, true);
  },
}).single("image");
