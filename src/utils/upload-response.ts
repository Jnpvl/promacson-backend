import type { Response } from "express";
import { saveUploadedImage, type UploadFolder } from "../services/storage.service";

export async function respondWithUploadedImage(
  res: Response,
  folder: UploadFolder,
  file: Express.Multer.File | undefined,
): Promise<Response> {
  if (!file) {
    return res.status(400).json({ error: "No se recibió ninguna imagen" });
  }

  try {
    const url = await saveUploadedImage(folder, file);
    return res.status(201).json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al subir imagen";
    return res.status(500).json({ error: message });
  }
}

export async function respondWithUploadedImages(
  res: Response,
  folder: UploadFolder,
  files: Express.Multer.File[] | undefined,
): Promise<Response> {
  if (!files?.length) {
    return res.status(400).json({ error: "No se recibió ninguna imagen" });
  }

  try {
    const urls = await Promise.all(files.map((file) => saveUploadedImage(folder, file)));
    return res.status(201).json({ urls });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al subir imágenes";
    return res.status(500).json({ error: message });
  }
}
