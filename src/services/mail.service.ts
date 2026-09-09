import nodemailer from "nodemailer";
import { isMailConfigured } from "../config/env";

type MailPayload = {
  subject: string;
  text: string;
  html: string;
};

function getMailPass(): string {
  // Gmail muestra la app password con espacios; SMTP la exige sin espacios.
  return (process.env.MAIL_PASS || "").replace(/\s+/g, "").trim();
}

function getTransporter() {
  const port = Number(process.env.MAIL_PORT) || 587;
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp-relay.brevo.com",
    port,
    secure: port === 465,
    connectionTimeout: 12_000,
    greetingTimeout: 12_000,
    socketTimeout: 12_000,
    auth: {
      user: process.env.MAIL_USER?.trim() ?? "",
      pass: getMailPass(),
    },
  });
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function mailTableRows(rows: [string, string][]): string {
  return rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;font-weight:600">${escapeHtml(label)}</td><td style="padding:6px 12px">${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("");
}

export async function sendNotificationEmail(payload: MailPayload): Promise<void> {
  if (!isMailConfigured()) {
    console.warn(
      "[mail] MAIL_USER/MAIL_PASS no configurados; se omite el envío de correo",
      {
        host: process.env.MAIL_HOST || null,
        userSet: Boolean(process.env.MAIL_USER?.trim()),
        passSet: Boolean(getMailPass()),
      },
    );
    return;
  }

  const to =
    process.env.MAIL_TO?.trim() ||
    process.env.MAIL_FROM?.trim() ||
    "serviciosmedicosrise@gmail.com";

  // Brevo: MAIL_USER es el login SMTP; MAIL_FROM debe ser un sender verificado.
  const fromAddress =
    process.env.MAIL_FROM?.trim() ||
    process.env.MAIL_TO?.trim() ||
    process.env.MAIL_USER?.trim() ||
    "";

  if (!fromAddress) {
    console.warn("[mail] MAIL_FROM/MAIL_TO/MAIL_USER vacíos; se omite el envío");
    return;
  }

  const transporter = getTransporter();
  const info = await transporter.sendMail({
    from: fromAddress,
    to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });
  console.log("[mail] Enviado", {
    to,
    from: fromAddress,
    subject: payload.subject,
    messageId: info.messageId,
    response: info.response,
  });
}
