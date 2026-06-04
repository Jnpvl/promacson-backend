import type { Request, Response } from "express";
import type { WholesaleStatus } from "../entities/wholesale-inquiry.entity";
import { wholesaleService } from "../services/wholesale.service";
import { parseAdminListParams } from "../utils/admin-list";

export class WholesaleController {
  async submit(req: Request, res: Response): Promise<Response> {
    const body = req.body as {
      clientType?: string;
      clientTypeOther?: string;
      institution?: string;
      customerName?: string;
      email?: string;
      phone?: string;
      volume?: string;
      interest?: string;
      message?: string;
    };

    const result = await wholesaleService.submit({
      clientType: String(body.clientType ?? ""),
      clientTypeOther: typeof body.clientTypeOther === "string" ? body.clientTypeOther : null,
      institution: String(body.institution ?? ""),
      customerName: String(body.customerName ?? ""),
      email: typeof body.email === "string" ? body.email : null,
      phone: typeof body.phone === "string" ? body.phone : null,
      volume: typeof body.volume === "string" ? body.volume : null,
      interest: typeof body.interest === "string" ? body.interest : null,
      message: typeof body.message === "string" ? body.message : null,
    });

    if (!result.ok) return res.status(400).json({ error: result.error });
    return res.status(201).json(result.inquiry);
  }

  async listAdmin(req: Request, res: Response): Promise<Response> {
    return res.json(await wholesaleService.listAdmin(parseAdminListParams(req.query)));
  }

  async getAdmin(req: Request, res: Response): Promise<Response> {
    const inquiry = await wholesaleService.getById(String(req.params.id));
    if (!inquiry) return res.status(404).json({ error: "Solicitud no encontrada" });
    return res.json(inquiry);
  }

  async updateStatus(req: Request, res: Response): Promise<Response> {
    const status = (req.body as { status?: string }).status as WholesaleStatus;
    const result = await wholesaleService.updateStatus(String(req.params.id), status);
    if (!result.ok) return res.status(result.status ?? 400).json({ error: result.error });
    return res.json(result.inquiry);
  }
}

export const wholesaleController = new WholesaleController();
