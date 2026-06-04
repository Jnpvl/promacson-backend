import { Brackets, In, SelectQueryBuilder } from "typeorm";
import { AppDataSource } from "../config/database";
import { Product } from "../entities/product.entity";
import { Quote, type QuoteStatus } from "../entities/quote.entity";
import { QuoteLine } from "../entities/quote-line.entity";
import { SALE_MODE_LABELS } from "./product.service";
import {
  buildLikeTerm,
  paginated,
  type AdminListParams,
  type PaginatedResult,
} from "../utils/admin-list";

const QUOTE_STATUSES = new Set<QuoteStatus>(["NEW", "QUOTE_SENT", "PURCHASED"]);

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  NEW: "Solicitud nueva",
  QUOTE_SENT: "Cotización enviada",
  PURCHASED: "Compra realizada",
};

export type QuoteLineInput = {
  productId: string;
  quantity: number;
};

export type QuoteSubmitInput = {
  customerName: string;
  email?: string | null;
  phone?: string | null;
  lines: QuoteLineInput[];
};

export type QuoteLineDto = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  saleModeLabel: string;
  quantity: number;
};

export type QuoteDto = {
  id: string;
  folio: string | null;
  status: QuoteStatus;
  statusLabel: string;
  customerName: string;
  email: string | null;
  phone: string | null;
  lines: QuoteLineDto[];
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function toDto(quote: Quote): QuoteDto {
  const lines = (quote.lines ?? []).map((line) => ({
    id: line.id,
    productId: line.productId,
    productName: line.productName,
    productSlug: line.productSlug,
    saleModeLabel: line.saleModeLabel,
    quantity: line.quantity,
  }));

  return {
    id: quote.id,
    folio: quote.folio,
    status: quote.status,
    statusLabel: QUOTE_STATUS_LABELS[quote.status],
    customerName: quote.customerName,
    email: quote.email,
    phone: quote.phone,
    lines,
    submittedAt: quote.submittedAt?.toISOString() ?? null,
    createdAt: quote.createdAt.toISOString(),
    updatedAt: quote.updatedAt.toISOString(),
  };
}

class QuoteService {
  private repo() {
    return AppDataSource.getRepository(Quote);
  }

  private lineRepo() {
    return AppDataSource.getRepository(QuoteLine);
  }

  private productRepo() {
    return AppDataSource.getRepository(Product);
  }

  private async nextFolio(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.repo().count();
    return `COT-${year}-${String(count + 1).padStart(5, "0")}`;
  }

  async submit(
    input: QuoteSubmitInput,
  ): Promise<{ ok: true; quote: QuoteDto } | { ok: false; error: string }> {
    const name = input.customerName?.trim();
    if (!name) return { ok: false, error: "El nombre es obligatorio" };

    const email = input.email?.trim() || null;
    const phone = input.phone?.trim() || null;
    if (!email && !phone) {
      return { ok: false, error: "Indica un correo o un teléfono de contacto" };
    }

    if (!input.lines?.length) {
      return { ok: false, error: "Agrega al menos un producto a la cotización" };
    }

    const productIds = [...new Set(input.lines.map((l) => l.productId))];
    const products = await this.productRepo().find({ where: { id: In(productIds) } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const lineRows: QuoteLine[] = [];
    for (const item of input.lines) {
      const qty = Math.max(1, Math.floor(item.quantity));
      const product = productMap.get(item.productId);
      if (!product || !Boolean(product.isActive)) {
        return { ok: false, error: "Uno de los productos ya no está disponible" };
      }
      lineRows.push(
        this.lineRepo().create({
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          saleModeLabel: SALE_MODE_LABELS[product.saleMode],
          quantity: qty,
        }),
      );
    }

    const quote = this.repo().create({
      folio: await this.nextFolio(),
      status: "NEW",
      customerName: name,
      email,
      phone,
      submittedAt: new Date(),
      lines: lineRows,
    });

    const saved = await this.repo().save(quote);
    const loaded = await this.getById(saved.id);
    return { ok: true, quote: loaded! };
  }

  async listAll(): Promise<QuoteDto[]> {
    const result = await this.listAdmin({ page: 1, pageSize: 10000, active: "all", status: "all" });
    return result.items;
  }

  async listAdmin(params: AdminListParams): Promise<PaginatedResult<QuoteDto>> {
    const { page, pageSize } = params;

    const applyFilters = (qb: SelectQueryBuilder<Quote>) => {
      if (params.status && params.status !== "all") {
        qb.andWhere("quote.status = :status", { status: params.status });
      } else if (params.active === "active") {
        qb.andWhere("quote.status IN (:...statuses)", { statuses: ["NEW", "QUOTE_SENT"] });
      } else if (params.active === "inactive") {
        qb.andWhere("quote.status = :status", { status: "PURCHASED" });
      }

      const like = buildLikeTerm(params.q);
      if (like) {
        qb.andWhere(
          new Brackets((sub) => {
            sub
              .where("quote.customer_name ILIKE :like", { like })
              .orWhere("quote.email ILIKE :like", { like })
              .orWhere("quote.phone ILIKE :like", { like })
              .orWhere("quote.folio ILIKE :like", { like });
          }),
        );
      }
      return qb;
    };

    const total = await applyFilters(this.repo().createQueryBuilder("quote")).getCount();

    const idRows = await applyFilters(this.repo().createQueryBuilder("quote"))
      .select("quote.id", "id")
      .orderBy("quote.created_at", "DESC")
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getRawMany<{ id: string }>();

    if (!idRows.length) {
      return paginated([], total, page, pageSize);
    }

    const ids = idRows.map((row) => row.id);
    const rows = await this.repo().find({
      where: { id: In(ids) },
      relations: ["lines"],
    });

    const order = new Map(ids.map((id, index) => [id, index]));
    rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

    return paginated(rows.map(toDto), total, page, pageSize);
  }

  async getById(id: string): Promise<QuoteDto | null> {
    const row = await this.repo().findOne({
      where: { id },
      relations: ["lines"],
    });
    return row ? toDto(row) : null;
  }

  async updateStatus(
    id: string,
    status: QuoteStatus,
  ): Promise<{ ok: true; quote: QuoteDto } | { ok: false; error: string; status?: number }> {
    if (!QUOTE_STATUSES.has(status)) {
      return { ok: false, error: "Estatus no válido" };
    }

    const row = await this.repo().findOne({ where: { id }, relations: ["lines"] });
    if (!row) return { ok: false, error: "Cotización no encontrada", status: 404 };

    row.status = status;
    const saved = await this.repo().save(row);
    return { ok: true, quote: toDto(saved) };
  }
}

export const quoteService = new QuoteService();
