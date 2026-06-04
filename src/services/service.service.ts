import { Brackets } from "typeorm";
import { AppDataSource } from "../config/database";
import { Service } from "../entities/service.entity";

export type ServiceContactType = "phone" | "email" | "whatsapp";

export type ServiceDto = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  body: string | null;
  imageUrl: string | null;
  href: string | null;
  contactType: ServiceContactType | null;
  contactValue: string | null;
  sortOrder: number;
  isActive: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
};

export type ServiceInput = {
  slug?: string;
  title: string;
  description?: string | null;
  body?: string | null;
  imageUrl?: string | null;
  href?: string | null;
  contactType?: ServiceContactType | null;
  contactValue?: string | null;
  isActive?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const CONTACT_TYPES = new Set<ServiceContactType>(["phone", "email", "whatsapp"]);
const MIN_SEARCH_LENGTH = 2;

function searchLikeTerm(query: string): string | null {
  const sanitized = query.trim().replace(/[%_\[\]]/g, "");
  if (sanitized.length < MIN_SEARCH_LENGTH) return null;
  return `%${sanitized}%`;
}

function parseContact(
  contactType: ServiceContactType | null | undefined,
  contactValue: string | null | undefined,
):
  | { ok: true; contactType: ServiceContactType | null; contactValue: string | null }
  | { ok: false; error: string } {
  const type = contactType && CONTACT_TYPES.has(contactType) ? contactType : null;
  const value = contactValue?.trim() || null;

  if (!type && !value) {
    return { ok: true, contactType: null, contactValue: null };
  }

  if (!type || !value) {
    return { ok: false, error: "El contacto requiere tipo y valor" };
  }

  if (type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return { ok: false, error: "El correo de contacto no es válido" };
  }

  return { ok: true, contactType: type, contactValue: value };
}

function resolveSeo(
  title: string,
  description: string | null,
  metaTitle: string | null,
  metaDescription: string | null,
): { seoTitle: string; seoDescription: string } {
  const seoTitle = metaTitle?.trim() || title;
  const seoDescription =
    metaDescription?.trim() ||
    description?.trim() ||
    `${title}. Conoce este servicio de Promacson Tienda.`;
  return { seoTitle, seoDescription };
}

function toDto(row: Service): ServiceDto {
  const seo = resolveSeo(row.title, row.description, row.metaTitle, row.metaDescription);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    body: row.body,
    imageUrl: row.imageUrl,
    href: row.externalHref,
    contactType: row.contactType,
    contactValue: row.contactValue,
    sortOrder: row.sortOrder,
    isActive: Boolean(row.isActive),
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    seoTitle: seo.seoTitle,
    seoDescription: seo.seoDescription,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

class ServiceService {
  private repo() {
    return AppDataSource.getRepository(Service);
  }

  async nextSortOrder(): Promise<number> {
    const result = await this.repo()
      .createQueryBuilder("service")
      .select("MAX(service.sort_order)", "max")
      .getRawOne<{ max: number | null }>();
    return (result?.max ?? -1) + 1;
  }

  async listPublic(): Promise<ServiceDto[]> {
    const rows = await this.repo().find({
      where: { isActive: true },
      order: { sortOrder: "ASC", title: "ASC" },
    });
    return rows.map(toDto);
  }

  async searchPublic(query: string): Promise<ServiceDto[]> {
    const term = searchLikeTerm(query);
    if (!term) return [];

    const rows = await this.repo()
      .createQueryBuilder("service")
      .where("service.is_active = :active", { active: true })
      .andWhere(
        new Brackets((qb) => {
          qb.where("service.title ILIKE :term", { term })
            .orWhere("service.description ILIKE :term", { term })
            .orWhere("service.body ILIKE :term", { term });
        }),
      )
      .orderBy("service.sort_order", "ASC")
      .addOrderBy("service.title", "ASC")
      .getMany();

    return rows.map(toDto);
  }

  async getBySlug(slug: string): Promise<ServiceDto | null> {
    const row = await this.repo().findOne({ where: { slug, isActive: true } });
    return row ? toDto(row) : null;
  }

  async listAll(): Promise<ServiceDto[]> {
    const rows = await this.repo().find({
      order: { sortOrder: "ASC", title: "ASC" },
    });
    return rows.map(toDto);
  }

  async getById(id: string): Promise<ServiceDto | null> {
    const row = await this.repo().findOne({ where: { id } });
    return row ? toDto(row) : null;
  }

  async create(
    input: ServiceInput,
  ): Promise<{ ok: true; service: ServiceDto } | { ok: false; error: string }> {
    if (!input.title?.trim()) return { ok: false, error: "El título es obligatorio" };

    const slug = normalizeSlug(input.slug?.trim() || input.title);
    if (!slug) return { ok: false, error: "El slug no es válido" };

    const exists = await this.repo().findOne({ where: { slug } });
    if (exists) return { ok: false, error: "Ya existe un servicio con ese slug" };

    const contact = parseContact(input.contactType, input.contactValue);
    if (!contact.ok) return { ok: false, error: contact.error };

    const row = this.repo().create({
      slug,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      body: input.body?.trim() || null,
      imageUrl: input.imageUrl?.trim() || null,
      externalHref: input.href?.trim() || null,
      contactType: contact.contactType,
      contactValue: contact.contactValue,
      sortOrder: await this.nextSortOrder(),
      isActive: input.isActive ?? true,
      metaTitle: input.metaTitle?.trim() || null,
      metaDescription: input.metaDescription?.trim() || null,
    });

    const saved = await this.repo().save(row);
    return { ok: true, service: toDto(saved) };
  }

  async update(
    id: string,
    input: ServiceInput,
  ): Promise<{ ok: true; service: ServiceDto } | { ok: false; error: string; status?: number }> {
    if (!input.title?.trim()) return { ok: false, error: "El título es obligatorio" };

    const row = await this.repo().findOne({ where: { id } });
    if (!row) return { ok: false, error: "Servicio no encontrado", status: 404 };

    const slug = normalizeSlug(input.slug?.trim() || input.title);
    if (!slug) return { ok: false, error: "El slug no es válido" };

    const duplicate = await this.repo().findOne({ where: { slug } });
    if (duplicate && duplicate.id !== id) {
      return { ok: false, error: "Ya existe otro servicio con ese slug" };
    }

    row.slug = slug;
    row.title = input.title.trim();
    row.description = input.description?.trim() || null;
    row.body = input.body?.trim() || null;
    row.imageUrl = input.imageUrl?.trim() || null;
    row.externalHref = input.href?.trim() || null;
    const contact = parseContact(input.contactType, input.contactValue);
    if (!contact.ok) return { ok: false, error: contact.error };
    row.contactType = contact.contactType;
    row.contactValue = contact.contactValue;
    row.isActive = input.isActive ?? row.isActive;
    row.metaTitle = input.metaTitle?.trim() || null;
    row.metaDescription = input.metaDescription?.trim() || null;

    const saved = await this.repo().save(row);
    return { ok: true, service: toDto(saved) };
  }

  async remove(id: string): Promise<{ ok: boolean; status?: number }> {
    const row = await this.repo().findOne({ where: { id } });
    if (!row) return { ok: false, status: 404 };
    await this.repo().remove(row);
    await this.normalizeSortOrder();
    return { ok: true };
  }

  private async normalizeSortOrder(): Promise<void> {
    const rows = await this.repo().find({ order: { sortOrder: "ASC", createdAt: "ASC" } });
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row) row.sortOrder = i;
    }
    if (rows.length) await this.repo().save(rows);
  }

  async move(
    id: string,
    direction: "up" | "down",
  ): Promise<
    | { ok: true; services: ServiceDto[] }
    | { ok: false; error: string; status?: number }
  > {
    const rows = await this.repo().find({ order: { sortOrder: "ASC", createdAt: "ASC" } });
    const index = rows.findIndex((r) => r.id === id);
    if (index === -1) return { ok: false, error: "Servicio no encontrado", status: 404 };

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rows.length) {
      return { ok: true, services: rows.map(toDto) };
    }

    const reordered = [...rows];
    const current = reordered[index];
    const neighbor = reordered[targetIndex];
    if (!current || !neighbor) return { ok: true, services: rows.map(toDto) };

    reordered[index] = neighbor;
    reordered[targetIndex] = current;

    for (let i = 0; i < reordered.length; i++) {
      const row = reordered[i];
      if (row) row.sortOrder = i;
    }

    await this.repo().save(reordered);
    return { ok: true, services: reordered.map(toDto) };
  }
}

export const serviceService = new ServiceService();
