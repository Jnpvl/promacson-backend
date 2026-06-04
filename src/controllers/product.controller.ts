import type { Request, Response } from "express";
import type { SaleMode } from "../entities/product.entity";
import { productService, type ProductInput } from "../services/product.service";
import { parseAdminListParams } from "../utils/admin-list";

function parseInput(body: Record<string, unknown>): ProductInput {
  const imageUrls = Array.isArray(body.imageUrls)
    ? body.imageUrls.filter((u): u is string => typeof u === "string")
    : [];

  const input: ProductInput = {
    name: String(body.name ?? ""),
    sku: typeof body.sku === "string" ? body.sku : null,
    description: typeof body.description === "string" ? body.description : null,
    saleMode: body.saleMode as SaleMode,
    categoryId: String(body.categoryId ?? ""),
    imageUrls,
    isActive: body.isActive !== false && body.isActive !== "false",
    isFeatured: body.isFeatured === true || body.isFeatured === "true",
    metaTitle: typeof body.metaTitle === "string" ? body.metaTitle : null,
    metaDescription: typeof body.metaDescription === "string" ? body.metaDescription : null,
  };

  if (typeof body.slug === "string" && body.slug.trim()) {
    input.slug = body.slug;
  }

  return input;
}

export class ProductController {
  async listPublic(req: Request, res: Response): Promise<Response> {
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    return res.json(await productService.listPublic(category));
  }

  async listFeatured(_req: Request, res: Response): Promise<Response> {
    return res.json(await productService.listFeatured());
  }

  async getBySlug(req: Request, res: Response): Promise<Response> {
    const product = await productService.getBySlug(String(req.params.slug));
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });
    return res.json(product);
  }

  async listAdmin(req: Request, res: Response): Promise<Response> {
    return res.json(await productService.listAdmin(parseAdminListParams(req.query)));
  }

  async getAdmin(req: Request, res: Response): Promise<Response> {
    const product = await productService.getById(String(req.params.id));
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });
    return res.json(product);
  }

  async create(req: Request, res: Response): Promise<Response> {
    const result = await productService.create(parseInput(req.body as Record<string, unknown>));
    if (!result.ok) return res.status(400).json({ error: result.error });
    return res.status(201).json(result.product);
  }

  async update(req: Request, res: Response): Promise<Response> {
    const result = await productService.update(
      String(req.params.id),
      parseInput(req.body as Record<string, unknown>),
    );
    if (!result.ok) return res.status(result.status ?? 400).json({ error: result.error });
    return res.json(result.product);
  }

  async remove(req: Request, res: Response): Promise<Response> {
    const result = await productService.remove(String(req.params.id));
    if (!result.ok) return res.status(result.status ?? 404).json({ error: "Producto no encontrado" });
    return res.status(204).send();
  }
}

export const productController = new ProductController();
