import { AppDataSource } from "../config/database";
import { Slider } from "../entities/slider.entity";

export type SliderDto = {
  id: string;
  sortOrder: number;
  isActive: boolean;
  eyebrow: string | null;
  title: string;
  description: string | null;
  imageUrl: string;
  hasPrimaryCta: boolean;
  primaryCtaLabel: string | null;
  primaryCtaHref: string | null;
  hasSecondaryCta: boolean;
  secondaryCtaLabel: string | null;
  secondaryCtaHref: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SliderInput = {
  sortOrder?: number;
  isActive?: boolean;
  eyebrow?: string | null;
  title: string;
  description?: string | null;
  imageUrl: string;
  hasPrimaryCta?: boolean;
  primaryCtaLabel?: string | null;
  primaryCtaHref?: string | null;
  hasSecondaryCta?: boolean;
  secondaryCtaLabel?: string | null;
  secondaryCtaHref?: string | null;
};

function toDto(slider: Slider): SliderDto {
  return {
    id: slider.id,
    sortOrder: slider.sortOrder,
    isActive: Boolean(slider.isActive),
    eyebrow: slider.eyebrow,
    title: slider.title,
    description: slider.description,
    imageUrl: slider.imageUrl,
    hasPrimaryCta: Boolean(slider.hasPrimaryCta),
    primaryCtaLabel: slider.primaryCtaLabel,
    primaryCtaHref: slider.primaryCtaHref,
    hasSecondaryCta: Boolean(slider.hasSecondaryCta),
    secondaryCtaLabel: slider.secondaryCtaLabel,
    secondaryCtaHref: slider.secondaryCtaHref,
    createdAt: slider.createdAt.toISOString(),
    updatedAt: slider.updatedAt.toISOString(),
  };
}

function normalizeHref(href: string | null | undefined): string | null {
  if (!href?.trim()) return null;
  const value = href.trim();
  if (value.startsWith("/")) return value;
  return `/${value.replace(/^\//, "")}`;
}

function validateCtas(input: SliderInput): string | null {
  if (input.hasPrimaryCta) {
    if (!input.primaryCtaLabel?.trim() || !input.primaryCtaHref?.trim()) {
      return "El botón principal requiere texto y ruta";
    }
  }
  if (input.hasSecondaryCta) {
    if (!input.secondaryCtaLabel?.trim() || !input.secondaryCtaHref?.trim()) {
      return "El botón secundario requiere texto y ruta";
    }
  }
  if (!input.hasPrimaryCta && input.hasSecondaryCta) {
    return "No puedes activar solo el botón secundario sin el principal";
  }
  return null;
}

class SliderService {
  private repo() {
    return AppDataSource.getRepository(Slider);
  }

  async nextSortOrder(): Promise<number> {
    const result = await this.repo()
      .createQueryBuilder("slider")
      .select("MAX(slider.sort_order)", "max")
      .getRawOne<{ max: number | null }>();
    return (result?.max ?? -1) + 1;
  }

  async listPublic(): Promise<SliderDto[]> {
    const rows = await this.repo().find({
      where: { isActive: true },
      order: { sortOrder: "ASC", createdAt: "ASC" },
    });
    return rows.map(toDto);
  }

  async listAll(): Promise<SliderDto[]> {
    const rows = await this.repo().find({
      order: { sortOrder: "ASC", createdAt: "ASC" },
    });
    return rows.map(toDto);
  }

  async getById(id: string): Promise<SliderDto | null> {
    const row = await this.repo().findOne({ where: { id } });
    return row ? toDto(row) : null;
  }

  async create(input: SliderInput): Promise<{ ok: true; slider: SliderDto } | { ok: false; error: string }> {
    const validation = validateCtas(input);
    if (validation) return { ok: false, error: validation };
    if (!input.title?.trim()) return { ok: false, error: "El título es obligatorio" };
    if (!input.imageUrl?.trim()) return { ok: false, error: "La imagen es obligatoria" };

    const slider = this.repo().create({
      sortOrder: input.sortOrder ?? (await this.nextSortOrder()),
      isActive: input.isActive ?? true,
      eyebrow: input.eyebrow?.trim() || null,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      imageUrl: input.imageUrl.trim(),
      hasPrimaryCta: Boolean(input.hasPrimaryCta),
      primaryCtaLabel: input.hasPrimaryCta ? input.primaryCtaLabel?.trim() || null : null,
      primaryCtaHref: input.hasPrimaryCta ? normalizeHref(input.primaryCtaHref) : null,
      hasSecondaryCta: Boolean(input.hasSecondaryCta),
      secondaryCtaLabel: input.hasSecondaryCta ? input.secondaryCtaLabel?.trim() || null : null,
      secondaryCtaHref: input.hasSecondaryCta ? normalizeHref(input.secondaryCtaHref) : null,
    });

    const saved = await this.repo().save(slider);
    return { ok: true, slider: toDto(saved) };
  }

  async update(
    id: string,
    input: SliderInput,
  ): Promise<{ ok: true; slider: SliderDto } | { ok: false; error: string; status?: number }> {
    const validation = validateCtas(input);
    if (validation) return { ok: false, error: validation };
    if (!input.title?.trim()) return { ok: false, error: "El título es obligatorio" };
    if (!input.imageUrl?.trim()) return { ok: false, error: "La imagen es obligatoria" };

    const row = await this.repo().findOne({ where: { id } });
    if (!row) return { ok: false, error: "Slider no encontrado", status: 404 };

    // sortOrder solo se cambia desde el listado (mover arriba/abajo)
    row.isActive = input.isActive ?? row.isActive;
    row.eyebrow = input.eyebrow?.trim() || null;
    row.title = input.title.trim();
    row.description = input.description?.trim() || null;
    row.imageUrl = input.imageUrl.trim();
    row.hasPrimaryCta = Boolean(input.hasPrimaryCta);
    row.primaryCtaLabel = input.hasPrimaryCta ? input.primaryCtaLabel?.trim() || null : null;
    row.primaryCtaHref = input.hasPrimaryCta ? normalizeHref(input.primaryCtaHref) : null;
    row.hasSecondaryCta = Boolean(input.hasSecondaryCta);
    row.secondaryCtaLabel = input.hasSecondaryCta ? input.secondaryCtaLabel?.trim() || null : null;
    row.secondaryCtaHref = input.hasSecondaryCta ? normalizeHref(input.secondaryCtaHref) : null;

    const saved = await this.repo().save(row);
    return { ok: true, slider: toDto(saved) };
  }

  async remove(id: string): Promise<{ ok: boolean; status?: number }> {
    const row = await this.repo().findOne({ where: { id } });
    if (!row) return { ok: false, status: 404 };
    await this.repo().remove(row);
    await this.normalizeSortOrder();
    return { ok: true };
  }

  private async normalizeSortOrder(): Promise<void> {
    const rows = await this.repo().find({
      order: { sortOrder: "ASC", createdAt: "ASC" },
    });
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
    | { ok: true; sliders: SliderDto[] }
    | { ok: false; error: string; status?: number }
  > {
    const rows = await this.repo().find({
      order: { sortOrder: "ASC", createdAt: "ASC" },
    });

    const index = rows.findIndex((row) => row.id === id);
    if (index === -1) return { ok: false, error: "Slider no encontrado", status: 404 };

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rows.length) {
      return { ok: true, sliders: rows.map(toDto) };
    }

    const reordered = [...rows];
    const current = reordered[index];
    const neighbor = reordered[targetIndex];
    if (!current || !neighbor) {
      return { ok: true, sliders: rows.map(toDto) };
    }
    reordered[index] = neighbor;
    reordered[targetIndex] = current;

    for (let i = 0; i < reordered.length; i++) {
      const row = reordered[i];
      if (row) row.sortOrder = i;
    }

    await this.repo().save(reordered);
    return { ok: true, sliders: reordered.map(toDto) };
  }
}

export const sliderService = new SliderService();
