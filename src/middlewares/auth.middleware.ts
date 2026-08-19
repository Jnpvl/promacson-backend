import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthPayload {
  sub: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

function jwtSecret(): string {
  return process.env.JWT_SECRET || "dev-secret-change-me";
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, jwtSecret()) as AuthPayload;
    req.auth = payload;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
}

/** Si hay Bearer, lo valida; si no hay, sigue sin req.auth. */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = header.slice("Bearer ".length);
  try {
    req.auth = jwt.verify(token, jwtSecret()) as AuthPayload;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
}
