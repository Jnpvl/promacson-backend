import type { Request, Response } from "express";
import { serviceService, type ServiceInput } from "../services/service.service";

function parseInput(body: Record<string, unknown>): ServiceInput {
  const input: ServiceInput = {
    title: String(body.title ?? ""),
    description: typeof body.description === "string" ? body.description : null,
    body: typeof body.body === "string" ? body.body : null,
    imageUrl: typeof body.imageUrl === "string" ? body.imageUrl : null,
    href: typeof body.href === "string" ? body.href : null,
    contactType:
      body.contactType === "phone" || body.contactType === "email" || body.contactType === "whatsapp"
        ? body.contactType
        : null,
    contactValue: typeof body.contactValue === "string" ? body.contactValue : null,
    isActive: body.isActive !== false && body.isActive !== "false",
    metaTitle: typeof body.metaTitle === "string" ? body.metaTitle : null,
    metaDescription: typeof body.metaDescription === "string" ? body.metaDescription : null,
  };
  if (typeof body.slug === "string" && body.slug.trim()) {
    input.slug = body.slug;
  }
  return input;
}

export class ServiceController {
  async listPublic(_req: Request, res: Response): Promise<Response> {
    return res.json(await serviceService.listPublic());
  }

  async getBySlug(req: Request, res: Response): Promise<Response> {
    const service = await serviceService.getBySlug(String(req.params.slug));
    if (!service) return res.status(404).json({ error: "Servicio no encontrado" });
    return res.json(service);
  }

  async listAdmin(_req: Request, res: Response): Promise<Response> {
    return res.json(await serviceService.listAll());
  }

  async getAdmin(req: Request, res: Response): Promise<Response> {
    const service = await serviceService.getById(String(req.params.id));
    if (!service) return res.status(404).json({ error: "Servicio no encontrado" });
    return res.json(service);
  }

  async create(req: Request, res: Response): Promise<Response> {
    const result = await serviceService.create(parseInput(req.body as Record<string, unknown>));
    if (!result.ok) return res.status(400).json({ error: result.error });
    return res.status(201).json(result.service);
  }

  async update(req: Request, res: Response): Promise<Response> {
    const result = await serviceService.update(
      String(req.params.id),
      parseInput(req.body as Record<string, unknown>),
    );
    if (!result.ok) return res.status(result.status ?? 400).json({ error: result.error });
    return res.json(result.service);
  }

  async remove(req: Request, res: Response): Promise<Response> {
    const result = await serviceService.remove(String(req.params.id));
    if (!result.ok) return res.status(result.status ?? 404).json({ error: "Servicio no encontrado" });
    return res.status(204).send();
  }

  async move(req: Request, res: Response): Promise<Response> {
    const direction = (req.body as { direction?: string }).direction;
    if (direction !== "up" && direction !== "down") {
      return res.status(400).json({ error: "direction debe ser up o down" });
    }
    const result = await serviceService.move(String(req.params.id), direction);
    if (!result.ok) return res.status(result.status ?? 400).json({ error: result.error });
    return res.json(result.services);
  }
}

export const serviceController = new ServiceController();
