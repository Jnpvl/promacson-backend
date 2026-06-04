import type { Request, Response } from "express";
import { siteSettingsService } from "../services/site-settings.service";

export class SiteController {
  async contact(_req: Request, res: Response): Promise<Response> {
    return res.json(await siteSettingsService.getContact());
  }
}

export const siteController = new SiteController();
