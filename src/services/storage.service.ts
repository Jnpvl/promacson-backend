import fs from "fs";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type UploadFolder = "sliders" | "products" | "categories" | "services";

const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

let supabaseClient: SupabaseClient | null = null;

export function isRemoteStorageEnabled(): boolean {
  return Boolean(
    process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}

function getSupabase(): SupabaseClient {
  if (supabaseClient) return supabaseClient;

  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error("Supabase Storage no configurado (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
  }

  supabaseClient = createClient(url, key);
  return supabaseClient;
}

function getBucketName(): string {
  return process.env.SUPABASE_STORAGE_BUCKET?.trim() || "promacson";
}

export function buildUploadFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase() || ".jpg";
  const safeExt = ALLOWED_EXT.has(ext) ? ext : ".jpg";
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
}

async function saveToSupabase(
  folder: UploadFolder,
  filename: string,
  buffer: Buffer,
  mimetype: string,
): Promise<string> {
  const bucket = getBucketName();
  const objectPath = `${folder}/${filename}`;
  const supabase = getSupabase();

  const { error } = await supabase.storage.from(bucket).upload(objectPath, buffer, {
    contentType: mimetype,
    upsert: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  return data.publicUrl;
}

function saveToDisk(folder: UploadFolder, filename: string, buffer: Buffer): string {
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, filename), buffer);
  return `/uploads/${folder}/${filename}`;
}

export async function saveUploadedImage(
  folder: UploadFolder,
  file: Express.Multer.File,
): Promise<string> {
  const filename = buildUploadFilename(file.originalname);
  const buffer = file.buffer;

  if (isRemoteStorageEnabled()) {
    return saveToSupabase(folder, filename, buffer, file.mimetype);
  }

  return saveToDisk(folder, filename, buffer);
}
