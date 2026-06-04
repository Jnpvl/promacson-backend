import type { Request, Response } from "express";
import type { QuoteStatus } from "../entities/quote.entity";
import { quoteService } from "../services/quote.service";
import { parseAdminListParams } from "../utils/admin-list";

export class QuoteController {
  async submit(req: Request, res: Response): Promise<Response> {
    const body = req.body as {
      customerName?: string;
      email?: string;
      phone?: string;
      lines?: { productId: string; quantity: number }[];
    };

    const result = await quoteService.submit({
      customerName: String(body.customerName ?? ""),
      email: typeof body.email === "string" ? body.email : null,
      phone: typeof body.phone === "string" ? body.phone : null,
      lines: Array.isArray(body.lines) ? body.lines : [],
    });

    if (!result.ok) return res.status(400).json({ error: result.error });
    return res.status(201).json(result.quote);
  }

  async listAdmin(req: Request, res: Response): Promise<Response> {
    return res.json(await quoteService.listAdmin(parseAdminListParams(req.query)));
  }

  async getAdmin(req: Request, res: Response): Promise<Response> {
    const quote = await quoteService.getById(String(req.params.id));
    if (!quote) return res.status(404).json({ error: "Cotización no encontrada" });
    return res.json(quote);
  }

  async updateStatus(req: Request, res: Response): Promise<Response> {
    const status = (req.body as { status?: string }).status as QuoteStatus;
    const result = await quoteService.updateStatus(String(req.params.id), status);
    if (!result.ok) return res.status(result.status ?? 400).json({ error: result.error });
    return res.json(result.quote);
  }
}

export const quoteController = new QuoteController();
