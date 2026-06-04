import { Brackets, SelectQueryBuilder } from "typeorm";
import { AppDataSource } from "../config/database";
import { Category } from "../entities/category.entity";
import { Product, type SaleMode } from "../entities/product.entity";
import { ProductImage } from "../entities/product-image.entity";
import {
  buildLikeTerm,
  paginated,
  type AdminListParams,
  type PaginatedResult,
} from "../utils/admin-list";

const SALE_MODES = new Set<SaleMode>(["UNIT_ONLY", "PACKAGE_ONLY", "BOTH"]);
const MIN_SEARCH_LENGTH = 2;

function searchLikeTerm(query: string): string | null {
  const sanitized = query.trim().replace(/[%_\[\]]/g, "");
  if (sanitized.length < MIN_SEARCH_LENGTH) return null;
  return `%${sanitized}%`;
}

export const SALE_MODE_LABELS: Record<SaleMode, string> = {
  UNIT_ONLY: "Solo pieza",
  PACKAGE_ONLY: "Solo caja",
  BOTH: "Pieza o caja",
};

export type ProductDto = {
  id: string;
  slug: string;
  name: string;
  sku: string | null;
  description: string | null;
  saleMode: SaleMode;
  badge: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  imageUrls: string[];
  coverImageUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = {
  slug?: string;
  name: string;
  sku?: string | null;
  description?: string | null;
  saleMode?: SaleMode;
  categoryId: string;
  imageUrls?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
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

function parseSaleMode(value: unknown): SaleMode {
  if (typeof value === "string" && SALE_MODES.has(value as SaleMode)) {
    return value as SaleMode;
  }
  return "BOTH";
}

function resolveSeo(
  name: string,
  description: string | null,
  metaTitle: string | null,
  metaDescription: string | null,
): { seoTitle: string; seoDescription: string } {
  const seoTitle = metaTitle?.trim() || name;
  const seoDescription =
    metaDescription?.trim() ||
    description?.trim() ||
    `${name}. Solicita cotización en Promacson Tienda.`;
  return { seoTitle, seoDescription };
}

function orderedImageUrls(images: ProductImage[] | undefined): string[] {
  if (!images?.length) return [];
  return [...images]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((img) => img.imageUrl);
}

function toDto(product: Product): ProductDto {
  const imageUrls = orderedImageUrls(product.images);
  const category = product.category;
  const seo = resolveSeo(
    product.name,
    product.description,
    product.metaTitle,
    product.metaDescription,
  );

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    sku: product.sku,
    description: product.description,
    saleMode: product.saleMode,
    badge: SALE_MODE_LABELS[product.saleMode],
    categoryId: product.categoryId,
    categorySlug: category?.slug ?? "",
    categoryName: category?.name ?? "",
    imageUrls,
    coverImageUrl: imageUrls[0] ?? null,
    isActive: Boolean(product.isActive),
    isFeatured: Boolean(product.isFeatured),
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    seoTitle: seo.seoTitle,
    seoDescription: seo.seoDescription,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

class ProductService {
  private repo() {
    return AppDataSource.getRepository(Product);
  }

  private imageRepo() {
    return AppDataSource.getRepository(ProductImage);
  }

  private categoryRepo() {
    return AppDataSource.getRepository(Category);
  }

  private baseQuery() {
    return this.repo().createQueryBuilder("product").leftJoinAndSelect("product.category", "category");
  }

  async getActiveCountByCategoryIds(categoryIds: string[]): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    if (!categoryIds.length) return map;

    const rows = await this.repo()
      .createQueryBuilder("product")
      .select("product.category_id", "categoryId")
      .addSelect("COUNT(*)", "count")
      .where("product.is_active = :active", { active: true })
      .andWhere("product.category_id IN (:...ids)", { ids: categoryIds })
      .groupBy("product.category_id")
      .getRawMany<{ categoryId: string; count: string }>();

    for (const row of rows) {
      map.set(row.categoryId, Number(row.count) || 0);
    }
    return map;
  }

  async listPublic(categorySlug?: string): Promise<ProductDto[]> {
    const qb = this.baseQuery().where("product.is_active = :active", { active: true });

    if (categorySlug?.trim()) {
      qb.andWhere("category.slug = :slug", { slug: categorySlug.trim() });
    }

    const rows = await qb
      .leftJoinAndSelect("product.images", "image")
      .orderBy("product.name", "ASC")
      .addOrderBy("image.sort_order", "ASC")
      .getMany();

    return rows.map(toDto);
  }

  async listFeatured(): Promise<ProductDto[]> {
    const rows = await this.baseQuery()
      .where("product.is_active = :active", { active: true })
      .andWhere("product.is_featured = :featured", { featured: true })
      .leftJoinAndSelect("product.images", "image")
      .orderBy("product.name", "ASC")
      .addOrderBy("image.sort_order", "ASC")
      .getMany();

    return rows.map(toDto);
  }

  async searchPublic(query: string): Promise<ProductDto[]> {
    const term = searchLikeTerm(query);
    if (!term) return [];

    const rows = await this.baseQuery()
      .where("product.is_active = :active", { active: true })
      .andWhere(
        new Brackets((qb) => {
          qb.where("product.name ILIKE :term", { term })
            .orWhere("product.sku ILIKE :term", { term })
            .orWhere("product.description ILIKE :term", { term })
            .orWhere("category.name ILIKE :term", { term });
        }),
      )
      .leftJoinAndSelect("product.images", "image")
      .orderBy("product.name", "ASC")
      .addOrderBy("image.sort_order", "ASC")
      .getMany();

    return rows.map(toDto);
  }

  async getBySlug(slug: string): Promise<ProductDto | null> {
    const row = await this.baseQuery()
      .where("product.slug = :slug", { slug })
      .andWhere("product.is_active = :active", { active: true })
      .leftJoinAndSelect("product.images", "image")
      .orderBy("image.sort_order", "ASC")
      .getOne();

    return row ? toDto(row) : null;
  }

  async listAll(): Promise<ProductDto[]> {
    const result = await this.listAdmin({ page: 1, pageSize: 10000, active: "all" });
    return result.items;
  }

  async listAdmin(params: AdminListParams): Promise<PaginatedResult<ProductDto>> {
    const { page, pageSize } = params;

    const applyFilters = (qb: SelectQueryBuilder<Product>) => {
      qb.leftJoin("product.category", "category");

      if (params.active === "active") {
        qb.andWhere("product.is_active = :active", { active: true });
      } else if (params.active === "inactive") {
        qb.andWhere("product.is_active = :active", { active: false });
      }

      const like = buildLikeTerm(params.q);
      if (like) {
        qb.andWhere(
          new Brackets((sub) => {
            sub
              .where("product.name ILIKE :like", { like })
              .orWhere("product.slug ILIKE :like", { like })
              .orWhere("product.sku ILIKE :like", { like })
              .orWhere("category.name ILIKE :like", { like });
          }),
        );
      }
      return qb;
    };

    const countQb = applyFilters(this.repo().createQueryBuilder("product"));
    const total = await countQb.getCount();

    const idRows = await applyFilters(this.repo().createQueryBuilder("product"))
      .select("product.id", "id")
      .orderBy("product.name", "ASC")
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getRawMany<{ id: string }>();

    if (!idRows.length) {
      return paginated([], total, page, pageSize);
    }

    const ids = idRows.map((row) => row.id);
    const rows = await this.baseQuery()
      .where("product.id IN (:...ids)", { ids })
      .leftJoinAndSelect("product.images", "image")
      .orderBy("product.name", "ASC")
      .addOrderBy("image.sort_order", "ASC")
      .getMany();

    return paginated(rows.map(toDto), total, page, pageSize);
  }

  async getById(id: string): Promise<ProductDto | null> {
    const row = await this.baseQuery()
      .where("product.id = :id", { id })
      .leftJoinAndSelect("product.images", "image")
      .orderBy("image.sort_order", "ASC")
      .getOne();

    return row ? toDto(row) : null;
  }

  private async syncImages(productId: string, imageUrls: string[]): Promise<void> {
    await this.imageRepo().delete({ productId });
    const urls = imageUrls.map((u) => u.trim()).filter(Boolean);
    if (!urls.length) return;

    const images = urls.map((url, index) =>
      this.imageRepo().create({
        productId,
        imageUrl: url,
        sortOrder: index,
      }),
    );
    await this.imageRepo().save(images);
  }

  private async validateCategory(categoryId: string): Promise<Category | null> {
    return this.categoryRepo().findOne({ where: { id: categoryId } });
  }

  async create(
    input: ProductInput,
  ): Promise<{ ok: true; product: ProductDto } | { ok: false; error: string }> {
    if (!input.name?.trim()) return { ok: false, error: "El nombre es obligatorio" };
    if (!input.categoryId?.trim()) return { ok: false, error: "La categoría es obligatoria" };

    const category = await this.validateCategory(input.categoryId);
    if (!category) return { ok: false, error: "Categoría no encontrada" };

    const imageUrls = input.imageUrls ?? [];
    if (!imageUrls.length) return { ok: false, error: "Agrega al menos una imagen" };

    const slug = normalizeSlug(input.slug?.trim() || input.name);
    if (!slug) return { ok: false, error: "El slug no es válido" };

    const exists = await this.repo().findOne({ where: { slug } });
    if (exists) return { ok: false, error: "Ya existe un producto con ese slug" };

    const sku = input.sku?.trim() || null;
    if (sku) {
      const skuExists = await this.repo().findOne({ where: { sku } });
      if (skuExists) return { ok: false, error: "Ya existe un producto con ese SKU" };
    }

    const row = this.repo().create({
      slug,
      name: input.name.trim(),
      sku,
      description: input.description?.trim() || null,
      saleMode: parseSaleMode(input.saleMode),
      categoryId: category.id,
      isActive: input.isActive ?? true,
      isFeatured: input.isFeatured ?? false,
      metaTitle: input.metaTitle?.trim() || null,
      metaDescription: input.metaDescription?.trim() || null,
    });

    const saved = await this.repo().save(row);
    await this.syncImages(saved.id, imageUrls);

    const loaded = await this.getById(saved.id);
    return { ok: true, product: loaded! };
  }

  async update(
    id: string,
    input: ProductInput,
  ): Promise<{ ok: true; product: ProductDto } | { ok: false; error: string; status?: number }> {
    if (!input.name?.trim()) return { ok: false, error: "El nombre es obligatorio" };
    if (!input.categoryId?.trim()) return { ok: false, error: "La categoría es obligatoria" };

    const row = await this.repo().findOne({ where: { id } });
    if (!row) return { ok: false, error: "Producto no encontrado", status: 404 };

    const category = await this.validateCategory(input.categoryId);
    if (!category) return { ok: false, error: "Categoría no encontrada" };

    const imageUrls = input.imageUrls ?? [];
    if (!imageUrls.length) return { ok: false, error: "Agrega al menos una imagen" };

    const slug = normalizeSlug(input.slug?.trim() || input.name);
    if (!slug) return { ok: false, error: "El slug no es válido" };

    const duplicate = await this.repo().findOne({ where: { slug } });
    if (duplicate && duplicate.id !== id) {
      return { ok: false, error: "Ya existe otro producto con ese slug" };
    }

    const sku = input.sku?.trim() || null;
    if (sku) {
      const skuExists = await this.repo().findOne({ where: { sku } });
      if (skuExists && skuExists.id !== id) {
        return { ok: false, error: "Ya existe otro producto con ese SKU" };
      }
    }

    row.slug = slug;
    row.name = input.name.trim();
    row.sku = sku;
    row.description = input.description?.trim() || null;
    row.saleMode = parseSaleMode(input.saleMode);
    row.categoryId = category.id;
    row.isActive = input.isActive ?? row.isActive;
    row.isFeatured = input.isFeatured ?? row.isFeatured;
    row.metaTitle = input.metaTitle?.trim() || null;
    row.metaDescription = input.metaDescription?.trim() || null;

    await this.repo().save(row);
    await this.syncImages(id, imageUrls);

    const loaded = await this.getById(id);
    return { ok: true, product: loaded! };
  }

  async remove(id: string): Promise<{ ok: boolean; status?: number }> {
    const row = await this.repo().findOne({ where: { id } });
    if (!row) return { ok: false, status: 404 };
    await this.repo().remove(row);
    return { ok: true };
  }
}

export const productService = new ProductService();
