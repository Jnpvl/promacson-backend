import type { Request, Response } from "express";
import { authService } from "../services/auth.service";

export class AuthController {
  async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
    }

    const result = await authService.login(email, password);
    if (!result.ok) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.json({ token: result.token, user: result.user });
  }

  async me(req: Request, res: Response): Promise<Response> {
    const user = await authService.getUserById(req.auth!.sub);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.json(user);
  }
}

export const authController = new AuthController();
