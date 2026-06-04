import type { Request } from "express";

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AdminListParams = {
  page: number;
  pageSize: number;
  q?: string;
  /** Categorías y productos: all | active | inactive */
  active?: "all" | "active" | "inactive";
  /** Cotizaciones / mayoreo: filtro por estatus concreto */
  status?:
    | "all"
    | "NEW"
    | "QUOTE_SENT"
    | "PURCHASED"
    | "CONTACTED"
    | "CLOSED";
};

export function parseAdminListParams(query: Request["query"]): AdminListParams {
  const page = Math.max(1, Number.parseInt(String(query.page ?? "1"), 10) || 1);
  const pageSize = Math.min(
    50,
    Math.max(5, Number.parseInt(String(query.pageSize ?? "10"), 10) || 10),
  );

  const qRaw = typeof query.q === "string" ? query.q.trim() : "";

  let active: AdminListParams["active"] = "all";
  const activeParam = typeof query.active === "string" ? query.active : "";
  if (activeParam === "true" || activeParam === "active") active = "active";
  if (activeParam === "false" || activeParam === "inactive") active = "inactive";

  let status: AdminListParams["status"] = "all";
  const statusParam = typeof query.status === "string" ? query.status : "";
  if (
    statusParam === "NEW" ||
    statusParam === "QUOTE_SENT" ||
    statusParam === "PURCHASED" ||
    statusParam === "CONTACTED" ||
    statusParam === "CLOSED"
  ) {
    status = statusParam;
  }

  return {
    page,
    pageSize,
    ...(qRaw ? { q: qRaw } : {}),
    active,
    status,
  };
}

export function buildLikeTerm(q?: string): string | null {
  if (!q?.trim()) return null;
  const sanitized = q.trim().replace(/[%_\[\]]/g, "");
  if (!sanitized) return null;
  return `%${sanitized}%`;
}

export function paginated<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
