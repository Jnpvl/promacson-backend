import fs from "fs";
import path from "path";
import dotenv from "dotenv";

function envCandidates(): string[] {
  return [
    path.resolve(process.cwd(), ".env"),
    path.resolve(__dirname, "../../.env"),
    path.resolve(__dirname, "../.env"),
  ];
}

export function loadEnv(): void {
  const file = envCandidates().find((candidate) => fs.existsSync(candidate));
  if (file) {
    dotenv.config({ path: file, override: true });
    return;
  }
  dotenv.config();
}

export function isMailConfigured(): boolean {
  const user = process.env.MAIL_USER?.trim();
  const pass = (process.env.MAIL_PASS || "").replace(/\s+/g, "").trim();
  return Boolean(user && pass);
}

export function logMailStatus(): void {
  if (!isMailConfigured()) {
    console.warn("[mail] MAIL_USER/MAIL_PASS no configurados; no se enviarán correos");
    return;
  }
  const to = process.env.MAIL_TO?.trim() || process.env.MAIL_USER?.trim();
  console.log(`[mail] Avisos de cotización/mayoreo → ${to}`);
}
