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

  async create(req: Request, res: Response): Promise<Response> {
    const { email, password, role } = req.body as {
      email?: string;
      password?: string;
      role?: string;
    };

    if (!email || !password) {
      return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
    }

    const userCount = await authService.countUsers();
    if (userCount === 0) {
      const result = await authService.createUser(email, password, "admin");
      if (!result.ok) return res.status(result.status).json({ error: result.error });
      return res.status(201).json({ user: result.user });
    }

    if (!req.auth) {
      return res.status(401).json({ error: "No autorizado" });
    }
    if (req.auth.role !== "admin") {
      return res.status(403).json({ error: "Solo un admin puede crear usuarios" });
    }

    const result = await authService.createUser(email, password, role ?? "admin");
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    return res.status(201).json({ user: result.user });
  }
}

export const authController = new AuthController();
