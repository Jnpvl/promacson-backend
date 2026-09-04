import nodemailer from "nodemailer";

type MailPayload = {
  subject: string;
  text: string;
  html: string;
};

function getMailPass(): string {
  // Gmail muestra la app password con espacios; SMTP la exige sin espacios.
  return (process.env.MAIL_PASS || "").replace(/\s+/g, "").trim();
}

function isMailConfigured(): boolean {
  return Boolean(process.env.MAIL_USER?.trim() && getMailPass());
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.MAIL_PORT) || 587,
    secure: false,
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
  await transporter.sendMail({
    from: `"Promacson" <${process.env.MAIL_USER}>`,
    to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });
}
