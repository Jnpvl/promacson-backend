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

/** Valores iniciales si aún no hay fila; el admin los edita en el panel. */
const INITIAL_CONTACT: SiteContactInput = {
  phone: "662 450 1230",
  phoneE164: "+526624501230",
  email: "ventas@promacson.mx",
  whatsapp: "526624501230",
  address: "C. Benito Juárez 177, Constitución, 83150 Hermosillo, Son.",
  businessHours: null,
  facebookUrl: null,
};

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

    row = this.repo().create({
      id: SETTINGS_ID,
      phone: INITIAL_CONTACT.phone,
      phoneE164: INITIAL_CONTACT.phoneE164,
      email: INITIAL_CONTACT.email,
      whatsapp: INITIAL_CONTACT.whatsapp.replace(/\D/g, ""),
      address: INITIAL_CONTACT.address ?? null,
      businessHours: INITIAL_CONTACT.businessHours ?? null,
      facebookUrl: INITIAL_CONTACT.facebookUrl ?? null,
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
