import type { Request } from "express";
import multer from "multer";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_PRODUCT_FILES = 12;

const memoryStorage = multer.memoryStorage();

function imageFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!ALLOWED.has(file.mimetype)) {
    cb(new Error("Solo se permiten imágenes JPG, PNG o WebP"));
    return;
  }
  cb(null, true);
}

const baseMulter = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: imageFilter,
});

export const sliderImageUpload = baseMulter.single("image");
export const categoryImageUpload = baseMulter.single("image");
export const serviceImageUpload = baseMulter.single("image");
export const productImagesUpload = baseMulter.array("images", MAX_PRODUCT_FILES);
