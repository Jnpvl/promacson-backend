import fs from "fs";
import path from "path";

export type UploadFolder = "sliders" | "products" | "categories" | "services";

const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export function buildUploadFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase() || ".jpg";
  const safeExt = ALLOWED_EXT.has(ext) ? ext : ".jpg";
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
}

export async function saveUploadedImage(
  folder: UploadFolder,
  file: Express.Multer.File,
): Promise<string> {
  const filename = buildUploadFilename(file.originalname);
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, filename), file.buffer);
  return `/uploads/${folder}/${filename}`;
}
