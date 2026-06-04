import type { Request, Response } from "express";
import { sliderService, type SliderInput } from "../services/slider.service";

function parseSliderInput(body: Record<string, unknown>): SliderInput {
  return {
    sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : Number(body.sortOrder) || 0,
    isActive: body.isActive !== false && body.isActive !== "false",
    eyebrow: typeof body.eyebrow === "string" ? body.eyebrow : null,
    title: String(body.title ?? ""),
    description: typeof body.description === "string" ? body.description : null,
    imageUrl: String(body.imageUrl ?? ""),
    hasPrimaryCta: body.hasPrimaryCta === true || body.hasPrimaryCta === "true",
    primaryCtaLabel: typeof body.primaryCtaLabel === "string" ? body.primaryCtaLabel : null,
    primaryCtaHref: typeof body.primaryCtaHref === "string" ? body.primaryCtaHref : null,
    hasSecondaryCta: body.hasSecondaryCta === true || body.hasSecondaryCta === "true",
    secondaryCtaLabel: typeof body.secondaryCtaLabel === "string" ? body.secondaryCtaLabel : null,
    secondaryCtaHref: typeof body.secondaryCtaHref === "string" ? body.secondaryCtaHref : null,
  };
}

export class SliderController {
  async listPublic(_req: Request, res: Response): Promise<Response> {
    const sliders = await sliderService.listPublic();
    return res.json(sliders);
  }

  async listAdmin(_req: Request, res: Response): Promise<Response> {
    const sliders = await sliderService.listAll();
    return res.json(sliders);
  }

  async getAdmin(req: Request, res: Response): Promise<Response> {
    const slider = await sliderService.getById(String(req.params.id));
    if (!slider) return res.status(404).json({ error: "Slider no encontrado" });
    return res.json(slider);
  }

  async create(req: Request, res: Response): Promise<Response> {
    const result = await sliderService.create(parseSliderInput(req.body as Record<string, unknown>));
    if (!result.ok) return res.status(400).json({ error: result.error });
    return res.status(201).json(result.slider);
  }

  async update(req: Request, res: Response): Promise<Response> {
    const result = await sliderService.update(
      String(req.params.id),
      parseSliderInput(req.body as Record<string, unknown>),
    );
    if (!result.ok) return res.status(result.status ?? 400).json({ error: result.error });
    return res.json(result.slider);
  }

  async remove(req: Request, res: Response): Promise<Response> {
    const result = await sliderService.remove(String(req.params.id));
    if (!result.ok) return res.status(result.status ?? 404).json({ error: "Slider no encontrado" });
    return res.status(204).send();
  }

  async move(req: Request, res: Response): Promise<Response> {
    const direction = (req.body as { direction?: string }).direction;
    if (direction !== "up" && direction !== "down") {
      return res.status(400).json({ error: "direction debe ser up o down" });
    }

    const result = await sliderService.move(String(req.params.id), direction);
    if (!result.ok) return res.status(result.status ?? 400).json({ error: result.error });
    return res.json(result.sliders);
  }
}

export const sliderController = new SliderController();
