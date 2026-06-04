import type { NextFunction, Request, Response } from "express";

type AsyncRoute = (req: Request, res: Response) => Promise<Response | void>;

export function asyncHandler(fn: AsyncRoute) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res)).catch(next);
  };
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
}
