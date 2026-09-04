import { Brackets, In, SelectQueryBuilder } from "typeorm";
import { AppDataSource } from "../config/database";
import {
  WholesaleInquiry,
  type WholesaleStatus,
} from "../entities/wholesale-inquiry.entity";
import {
  buildLikeTerm,
  paginated,
  type AdminListParams,
  type PaginatedResult,
} from "../utils/admin-list";
import { mailTableRows, sendNotificationEmail } from "./mail.service";

const WHOLESALE_STATUSES = new Set<WholesaleStatus>(["NEW", "CONTACTED", "CLOSED"]);

export const WHOLESALE_STATUS_LABELS: Record<WholesaleStatus, string> = {
  NEW: "Solicitud nueva",
  CONTACTED: "Contactado",
  CLOSED: "Cerrada",
};

export const CLIENT_TYPE_LABELS: Record<string, string> = {
  clinica: "Clínica",
  hospital: "Hospital",
  distribuidor: "Distribuidor de insumos",
  farmacia: "Farmacia",
  otro: "Otro",
};

export type WholesaleSubmitInput = {
  clientType: string;
  clientTypeOther?: string | null;
  institution: string;
  customerName: string;
  email?: string | null;
  phone?: string | null;
  volume?: string | null;
  interest?: string | null;
  message?: string | null;
};

export type WholesaleDto = {
  id: string;
  folio: string | null;
  status: WholesaleStatus;
  statusLabel: string;
  clientType: string;
  clientTypeLabel: string;
  clientTypeOther: string | null;
  institution: string;
  customerName: string;
  email: string | null;
  phone: string | null;
  volume: string | null;
  interest: string | null;
  message: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function clientTypeLabel(type: string, other: string | null): string {
  if (type === "otro" && other?.trim()) return other.trim();
  return CLIENT_TYPE_LABELS[type] ?? type;
}

function toDto(row: WholesaleInquiry): WholesaleDto {
  return {
    id: row.id,
    folio: row.folio,
    status: row.status,
    statusLabel: WHOLESALE_STATUS_LABELS[row.status],
    clientType: row.clientType,
    clientTypeLabel: clientTypeLabel(row.clientType, row.clientTypeOther),
    clientTypeOther: row.clientTypeOther,
    institution: row.institution,
    customerName: row.customerName,
    email: row.email,
    phone: row.phone,
    volume: row.volume,
    interest: row.interest,
    message: row.message,
    submittedAt: row.submittedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

class WholesaleService {
  private repo() {
    return AppDataSource.getRepository(WholesaleInquiry);
  }

  private async nextFolio(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.repo().count();
    return `MAY-${year}-${String(count + 1).padStart(5, "0")}`;
  }

  async submit(
    input: WholesaleSubmitInput,
  ): Promise<{ ok: true; inquiry: WholesaleDto } | { ok: false; error: string }> {
    const clientType = input.clientType?.trim();
    if (!clientType) return { ok: false, error: "Selecciona el tipo de cliente" };

    const clientTypeOther =
      clientType === "otro" ? input.clientTypeOther?.trim() || null : null;
    if (clientType === "otro" && !clientTypeOther) {
      return { ok: false, error: "Indica el tipo de cliente" };
    }

    const institution = input.institution?.trim();
    if (!institution) return { ok: false, error: "La institución es obligatoria" };

    const customerName = input.customerName?.trim();
    if (!customerName) return { ok: false, error: "El nombre de contacto es obligatorio" };

    const email = input.email?.trim() || null;
    const phone = input.phone?.trim() || null;
    if (!email && !phone) {
      return { ok: false, error: "Indica un correo o un teléfono de contacto" };
    }

    const row = this.repo().create({
      folio: await this.nextFolio(),
      status: "NEW",
      clientType,
      clientTypeOther,
      institution,
      customerName,
      email,
      phone,
      volume: input.volume?.trim() || null,
      interest: input.interest?.trim() || null,
      message: input.message?.trim() || null,
      submittedAt: new Date(),
    });

    const saved = await this.repo().save(row);
    const dto = toDto(saved);
    void this.notifyByEmail(dto);
    return { ok: true, inquiry: dto };
  }

  private async notifyByEmail(inquiry: WholesaleDto): Promise<void> {
    try {
      const title = "Promacson - mayoreo";
      const rows: [string, string][] = [
        ["Folio", inquiry.folio ?? "—"],
        ["Tipo de cliente", inquiry.clientTypeLabel],
        ["Institución", inquiry.institution],
        ["Nombre", inquiry.customerName],
        ...(inquiry.email ? ([["Correo", inquiry.email]] as [string, string][]) : []),
        ...(inquiry.phone ? ([["Teléfono", inquiry.phone]] as [string, string][]) : []),
        ...(inquiry.volume ? ([["Volumen", inquiry.volume]] as [string, string][]) : []),
        ...(inquiry.interest ? ([["Interés", inquiry.interest]] as [string, string][]) : []),
        ...(inquiry.message ? ([["Mensaje", inquiry.message]] as [string, string][]) : []),
      ];

      const textLines = [
        title,
        "",
        ...rows.map(([label, value]) => `${label}: ${value}`),
        "",
        `ID: ${inquiry.id}`,
      ];

      await sendNotificationEmail({
        subject: `${title} — ${inquiry.customerName}`,
        text: textLines.join("\n"),
        html: `
          <h2>${title}</h2>
          <table style="border-collapse:collapse">${mailTableRows(rows)}</table>
          <p style="color:#666;font-size:12px;margin-top:16px">ID: ${inquiry.id}</p>
        `,
      });
    } catch (err) {
      console.error("[mail] Error enviando notificación de mayoreo:", err);
    }
  }

  async listAdmin(params: AdminListParams): Promise<PaginatedResult<WholesaleDto>> {
    const { page, pageSize } = params;

    const applyFilters = (qb: SelectQueryBuilder<WholesaleInquiry>) => {
      if (params.status && params.status !== "all") {
        const status = params.status as WholesaleStatus;
        if (WHOLESALE_STATUSES.has(status)) {
          qb.andWhere("inquiry.status = :status", { status });
        }
      } else if (params.active === "active") {
        qb.andWhere("inquiry.status IN (:...statuses)", { statuses: ["NEW", "CONTACTED"] });
      } else if (params.active === "inactive") {
        qb.andWhere("inquiry.status = :status", { status: "CLOSED" });
      }

      const like = buildLikeTerm(params.q);
      if (like) {
        qb.andWhere(
          new Brackets((sub) => {
            sub
              .where("inquiry.customer_name ILIKE :like", { like })
              .orWhere("inquiry.institution ILIKE :like", { like })
              .orWhere("inquiry.email ILIKE :like", { like })
              .orWhere("inquiry.phone ILIKE :like", { like })
              .orWhere("inquiry.folio ILIKE :like", { like })
              .orWhere("inquiry.client_type_other ILIKE :like", { like });
          }),
        );
      }
      return qb;
    };

    const total = await applyFilters(this.repo().createQueryBuilder("inquiry")).getCount();

    const idRows = await applyFilters(this.repo().createQueryBuilder("inquiry"))
      .select("inquiry.id", "id")
      .orderBy("inquiry.created_at", "DESC")
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getRawMany<{ id: string }>();

    if (!idRows.length) {
      return paginated([], total, page, pageSize);
    }

    const ids = idRows.map((row) => row.id);
    const rows = await this.repo().find({ where: { id: In(ids) } });

    const order = new Map(ids.map((id, index) => [id, index]));
    rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

    return paginated(rows.map(toDto), total, page, pageSize);
  }

  async getById(id: string): Promise<WholesaleDto | null> {
    const row = await this.repo().findOne({ where: { id } });
    return row ? toDto(row) : null;
  }

  async updateStatus(
    id: string,
    status: WholesaleStatus,
  ): Promise<{ ok: true; inquiry: WholesaleDto } | { ok: false; error: string; status?: number }> {
    if (!WHOLESALE_STATUSES.has(status)) {
      return { ok: false, error: "Estatus no válido" };
    }

    const row = await this.repo().findOne({ where: { id } });
    if (!row) return { ok: false, error: "Solicitud no encontrada", status: 404 };

    row.status = status;
    const saved = await this.repo().save(row);
    return { ok: true, inquiry: toDto(saved) };
  }
}

export const wholesaleService = new WholesaleService();
