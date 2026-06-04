import type { Request, Response } from "express";

export class HealthController {
  check(_req: Request, res: Response): Response {
    return res.json({ status: "ok", service: "promacson-backend" });
  }
}

export const healthController = new HealthController();
