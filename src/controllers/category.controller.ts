import type { Request, Response } from "express";
import { categoryService, type CategoryInput } from "../services/category.service";
import { parseAdminListParams } from "../utils/admin-list";

function parseInput(body: Record<string, unknown>): CategoryInput {
  const input: CategoryInput = {
    name: String(body.name ?? ""),
    description: typeof body.description === "string" ? body.description : null,
    imageUrl: typeof body.imageUrl === "string" ? body.imageUrl : null,
    isActive: body.isActive !== false && body.isActive !== "false",
    metaTitle: typeof body.metaTitle === "string" ? body.metaTitle : null,
    metaDescription: typeof body.metaDescription === "string" ? body.metaDescription : null,
  };
  if (typeof body.slug === "string" && body.slug.trim()) {
    input.slug = body.slug;
  }
  return input;
}

export class CategoryController {
  async listPublic(_req: Request, res: Response): Promise<Response> {
    const categories = await categoryService.listPublic();
    return res.json(categories);
  }

  async getBySlug(req: Request, res: Response): Promise<Response> {
    const category = await categoryService.getBySlug(String(req.params.slug));
    if (!category) return res.status(404).json({ error: "Categoría no encontrada" });
    return res.json(category);
  }

  async listAdmin(req: Request, res: Response): Promise<Response> {
    return res.json(await categoryService.listAdmin(parseAdminListParams(req.query)));
  }

  async getAdmin(req: Request, res: Response): Promise<Response> {
    const category = await categoryService.getById(String(req.params.id));
    if (!category) return res.status(404).json({ error: "Categoría no encontrada" });
    return res.json(category);
  }

  async create(req: Request, res: Response): Promise<Response> {
    const result = await categoryService.create(parseInput(req.body as Record<string, unknown>));
    if (!result.ok) return res.status(400).json({ error: result.error });
    return res.status(201).json(result.category);
  }

  async update(req: Request, res: Response): Promise<Response> {
    const result = await categoryService.update(
      String(req.params.id),
      parseInput(req.body as Record<string, unknown>),
    );
    if (!result.ok) return res.status(result.status ?? 400).json({ error: result.error });
    return res.json(result.category);
  }

  async remove(req: Request, res: Response): Promise<Response> {
    const result = await categoryService.remove(String(req.params.id));
    if (!result.ok) return res.status(result.status ?? 404).json({ error: "Categoría no encontrada" });
    return res.status(204).send();
  }

  async move(req: Request, res: Response): Promise<Response> {
    const direction = (req.body as { direction?: string }).direction;
    if (direction !== "up" && direction !== "down") {
      return res.status(400).json({ error: "direction debe ser up o down" });
    }
    const result = await categoryService.move(String(req.params.id), direction);
    if (!result.ok) return res.status(result.status ?? 400).json({ error: result.error });
    return res.json({ ok: true });
  }
}

export const categoryController = new CategoryController();
