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
    host: process.env.MAIL_HOST || "smtp.gmail.com",
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
    console.warn("[mail] MAIL_USER/MAIL_PASS no configurados; se omite el envío de correo");
    return;
  }

  const to =
    process.env.MAIL_TO?.trim() ||
    process.env.MAIL_USER?.trim() ||
    "serviciosmedicosrise@gmail.com";

  const transporter = getTransporter();
  const info = await transporter.sendMail({
    from: `"Promacson" <${process.env.MAIL_USER?.trim()}>`,
    to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });
  console.log(`[mail] Enviado "${payload.subject}" → ${to} (${info.response})`);
}
