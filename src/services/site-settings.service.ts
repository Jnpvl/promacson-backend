import { AppDataSource } from "../config/database";
import { SiteSettings } from "../entities/site-settings.entity";

export type SiteContactDto = {
  phone: string;
  phoneE164: string;
  email: string;
  whatsapp: string;
  address: string | null;
  businessHours: string | null;
  facebookUrl: string | null;
};

export type SiteContactInput = {
  phone: string;
  phoneE164: string;
  email: string;
  whatsapp: string;
  address?: string | null;
  businessHours?: string | null;
  facebookUrl?: string | null;
};

const SETTINGS_ID = "default";

function envDefaults(): SiteContactInput {
  return {
    phone: process.env.SITE_PHONE || "662 450 1230",
    phoneE164: process.env.SITE_PHONE_E164 || "+526624501230",
    email: process.env.SITE_EMAIL || "ventas@promacson.mx",
    whatsapp: process.env.SITE_WHATSAPP || "526624501230",
    address:
      process.env.SITE_ADDRESS ||
      "C. Benito Juárez 177, Constitución, 83150 Hermosillo, Son.",
    businessHours: process.env.SITE_BUSINESS_HOURS || null,
    facebookUrl: process.env.SITE_FACEBOOK_URL || null,
  };
}

function toDto(row: SiteSettings): SiteContactDto {
  return {
    phone: row.phone,
    phoneE164: row.phoneE164,
    email: row.email,
    whatsapp: row.whatsapp,
    address: row.address,
    businessHours: row.businessHours,
    facebookUrl: row.facebookUrl,
  };
}

class SiteSettingsService {
  private repo() {
    return AppDataSource.getRepository(SiteSettings);
  }

  private async ensureRow(): Promise<SiteSettings> {
    let row = await this.repo().findOne({ where: { id: SETTINGS_ID } });
    if (row) return row;

    const defaults = envDefaults();
    row = this.repo().create({
      id: SETTINGS_ID,
      phone: defaults.phone,
      phoneE164: defaults.phoneE164,
      email: defaults.email,
      whatsapp: defaults.whatsapp.replace(/\D/g, ""),
      address: defaults.address ?? null,
      businessHours: defaults.businessHours ?? null,
      facebookUrl: defaults.facebookUrl ?? null,
    });
    return this.repo().save(row);
  }

  async getContact(): Promise<SiteContactDto> {
    const row = await this.ensureRow();
    return toDto(row);
  }

  async update(
    input: SiteContactInput,
  ): Promise<{ ok: true; contact: SiteContactDto } | { ok: false; error: string }> {
    if (!input.phone?.trim()) return { ok: false, error: "El teléfono es obligatorio" };
    if (!input.phoneE164?.trim()) return { ok: false, error: "El teléfono E.164 es obligatorio" };
    if (!input.email?.trim()) return { ok: false, error: "El correo es obligatorio" };
    if (!input.whatsapp?.trim()) return { ok: false, error: "WhatsApp es obligatorio" };

    const email = input.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: "El correo no es válido" };
    }

    const facebook = input.facebookUrl?.trim() || null;
    if (facebook && !/^https?:\/\//i.test(facebook)) {
      return { ok: false, error: "Facebook debe ser una URL (https://…)" };
    }

    const row = await this.ensureRow();
    row.phone = input.phone.trim();
    row.phoneE164 = input.phoneE164.trim();
    row.email = email;
    row.whatsapp = input.whatsapp.replace(/\D/g, "");
    row.address = input.address?.trim() || null;
    row.businessHours = input.businessHours?.trim() || null;
    row.facebookUrl = facebook;

    const saved = await this.repo().save(row);
    return { ok: true, contact: toDto(saved) };
  }
}

export const siteSettingsService = new SiteSettingsService();
