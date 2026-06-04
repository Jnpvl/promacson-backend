import { AppDataSource } from "../config/database";
import { Category } from "../entities/category.entity";
import { productService } from "./product.service";
import {
  buildLikeTerm,
  paginated,
  type AdminListParams,
  type PaginatedResult,
} from "../utils/admin-list";
import { Brackets } from "typeorm";

export type CategoryDto = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  /** Valores guardados en BD (vacío = autogenerar en sitio). */
  metaTitle: string | null;
  metaDescription: string | null;
  /** SEO resuelto para el sitio público. */
  seoTitle: string;
  seoDescription: string;
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CategoryInput = {
  slug?: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
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

function resolveSeo(
  name: string,
  description: string | null,
  metaTitle: string | null,
  metaDescription: string | null,
): { metaTitle: string; metaDescription: string } {
  const siteSuffix = " | Promacson Tienda";
  const title = metaTitle?.trim() || `${name}${siteSuffix}`;
  const desc =
    metaDescription?.trim() ||
    description?.trim() ||
    `Explora ${name} en el catálogo de insumos médicos Promacson. Solicita cotización.`;
  return { metaTitle: title, metaDescription: desc };
}

function toDto(row: Category, productCount = 0): CategoryDto {
  const seo = resolveSeo(row.name, row.description, row.metaTitle, row.metaDescription);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    imageUrl: row.imageUrl,
    sortOrder: row.sortOrder,
    isActive: Boolean(row.isActive),
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    seoTitle: seo.metaTitle,
    seoDescription: seo.metaDescription,
    productCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

class CategoryService {
  private repo() {
    return AppDataSource.getRepository(Category);
  }

  async nextSortOrder(): Promise<number> {
    const result = await this.repo()
      .createQueryBuilder("category")
      .select("MAX(category.sort_order)", "max")
      .getRawOne<{ max: number | null }>();
    return (result?.max ?? -1) + 1;
  }

  private async withProductCounts(rows: Category[]): Promise<CategoryDto[]> {
    const counts = await productService.getActiveCountByCategoryIds(rows.map((r) => r.id));
    return rows.map((r) => toDto(r, counts.get(r.id) ?? 0));
  }

  async listPublic(): Promise<CategoryDto[]> {
    const rows = await this.repo().find({
      where: { isActive: true },
      order: { sortOrder: "ASC", name: "ASC" },
    });
    return this.withProductCounts(rows);
  }

  async getBySlug(slug: string): Promise<CategoryDto | null> {
    const row = await this.repo().findOne({ where: { slug, isActive: true } });
    if (!row) return null;
    const counts = await productService.getActiveCountByCategoryIds([row.id]);
    return toDto(row, counts.get(row.id) ?? 0);
  }

  async listAll(): Promise<CategoryDto[]> {
    const result = await this.listAdmin({ page: 1, pageSize: 10000, active: "all" });
    return result.items;
  }

  async listAdmin(params: AdminListParams): Promise<PaginatedResult<CategoryDto>> {
    const { page, pageSize } = params;
    const qb = this.repo().createQueryBuilder("category");

    if (params.active === "active") {
      qb.andWhere("category.is_active = :active", { active: true });
    } else if (params.active === "inactive") {
      qb.andWhere("category.is_active = :active", { active: false });
    }

    const like = buildLikeTerm(params.q);
    if (like) {
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where("category.name ILIKE :like", { like })
            .orWhere("category.slug ILIKE :like", { like });
        }),
      );
    }

    qb.orderBy("category.sort_order", "ASC").addOrderBy("category.name", "ASC");

    const total = await qb.getCount();
    const rows = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    const items = await this.withProductCounts(rows);
    return paginated(items, total, page, pageSize);
  }

  async getById(id: string): Promise<CategoryDto | null> {
    const row = await this.repo().findOne({ where: { id } });
    if (!row) return null;
    const counts = await productService.getActiveCountByCategoryIds([row.id]);
    return toDto(row, counts.get(row.id) ?? 0);
  }

  async create(
    input: CategoryInput,
  ): Promise<{ ok: true; category: CategoryDto } | { ok: false; error: string }> {
    if (!input.name?.trim()) return { ok: false, error: "El nombre es obligatorio" };

    const slug = normalizeSlug(input.slug?.trim() || input.name);
    if (!slug) return { ok: false, error: "El slug no es válido" };

    const exists = await this.repo().findOne({ where: { slug } });
    if (exists) return { ok: false, error: "Ya existe una categoría con ese slug" };

    const row = this.repo().create({
      slug,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      imageUrl: input.imageUrl?.trim() || null,
      sortOrder: await this.nextSortOrder(),
      isActive: input.isActive ?? true,
      metaTitle: input.metaTitle?.trim() || null,
      metaDescription: input.metaDescription?.trim() || null,
    });

    const saved = await this.repo().save(row);
    return { ok: true, category: toDto(saved, 0) };
  }

  async update(
    id: string,
    input: CategoryInput,
  ): Promise<{ ok: true; category: CategoryDto } | { ok: false; error: string; status?: number }> {
    if (!input.name?.trim()) return { ok: false, error: "El nombre es obligatorio" };

    const row = await this.repo().findOne({ where: { id } });
    if (!row) return { ok: false, error: "Categoría no encontrada", status: 404 };

    const slug = normalizeSlug(input.slug?.trim() || input.name);
    if (!slug) return { ok: false, error: "El slug no es válido" };

    const duplicate = await this.repo().findOne({ where: { slug } });
    if (duplicate && duplicate.id !== id) {
      return { ok: false, error: "Ya existe otra categoría con ese slug" };
    }

    row.slug = slug;
    row.name = input.name.trim();
    row.description = input.description?.trim() || null;
    row.imageUrl = input.imageUrl?.trim() || null;
    row.isActive = input.isActive ?? row.isActive;
    row.metaTitle = input.metaTitle?.trim() || null;
    row.metaDescription = input.metaDescription?.trim() || null;

    const saved = await this.repo().save(row);
    return { ok: true, category: toDto(saved, 0) };
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
  ): Promise<{ ok: true } | { ok: false; error: string; status?: number }> {
    const rows = await this.repo().find({ order: { sortOrder: "ASC", createdAt: "ASC" } });
    const index = rows.findIndex((r) => r.id === id);
    if (index === -1) return { ok: false, error: "Categoría no encontrada", status: 404 };

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rows.length) {
      return { ok: true };
    }

    const reordered = [...rows];
    const current = reordered[index];
    const neighbor = reordered[targetIndex];
    if (!current || !neighbor) return { ok: true };

    reordered[index] = neighbor;
    reordered[targetIndex] = current;

    for (let i = 0; i < reordered.length; i++) {
      const row = reordered[i];
      if (row) row.sortOrder = i;
    }

    await this.repo().save(reordered);
    return { ok: true };
  }
}

export const categoryService = new CategoryService();
