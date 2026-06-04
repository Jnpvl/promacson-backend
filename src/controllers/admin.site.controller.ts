import type { Request, Response } from "express";
import {
  siteSettingsService,
  type SiteContactInput,
} from "../services/site-settings.service";

function parseInput(body: Record<string, unknown>): SiteContactInput {
  return {
    phone: String(body.phone ?? ""),
    phoneE164: String(body.phoneE164 ?? ""),
    email: typeof body.email === "string" ? body.email : "",
    whatsapp: typeof body.whatsapp === "string" ? body.whatsapp : "",
    address: typeof body.address === "string" ? body.address : null,
    businessHours: typeof body.businessHours === "string" ? body.businessHours : null,
    facebookUrl: typeof body.facebookUrl === "string" ? body.facebookUrl : null,
  };
}

export class AdminSiteController {
  async getContact(_req: Request, res: Response): Promise<Response> {
    return res.json(await siteSettingsService.getContact());
  }

  async updateContact(req: Request, res: Response): Promise<Response> {
    const result = await siteSettingsService.update(parseInput(req.body as Record<string, unknown>));
    if (!result.ok) return res.status(400).json({ error: result.error });
    return res.json(result.contact);
  }
}

export const adminSiteController = new AdminSiteController();
