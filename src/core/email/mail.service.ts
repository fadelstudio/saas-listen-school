import axios from "axios";
import nodemailer from "nodemailer";
import { env } from "../config/env";
import { logger } from "../../utils/logger";

let smtpTransporter: nodemailer.Transporter | null = null;

function getSmtpTransporter() {
  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth:
        env.SMTP_USER && env.SMTP_PASS
          ? {
              user: env.SMTP_USER,
              pass: env.SMTP_PASS,
            }
          : undefined,
    });
  }
  return smtpTransporter;
}

/**
 * Sends transactional email.
 * - `MAIL_PROVIDER=console`: log only (dev).
 * - `MAIL_PROVIDER=smtp`: use SMTP (for Mailtrap/Ethereal).
 * - `MAIL_PROVIDER=resend`: HTTPS API Resend (`RESEND_API_KEY`, `EMAIL_FROM` vérifié côté Resend).
 */
export async function sendTransactionalEmail(params: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  if (env.MAIL_PROVIDER === "console") {
    logger.info("[mail:console]", {
      to: params.to,
      subject: params.subject,
      text: params.text.slice(0, 500),
    });
    return;
  }

  if (env.MAIL_PROVIDER === "smtp") {
    const transporter = getSmtpTransporter();
    try {
      const info = await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html ?? `<pre>${escapeHtml(params.text)}</pre>`,
      });

      // Ethereal helper URL to preview outbound emails in browser.
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        logger.info("[mail:smtp:preview]", { to: params.to, previewUrl });
      }
      return;
    } catch (smtpError) {
      logger.warn("[mail:smtp] failed, attempting resend fallback", {
        error: (smtpError as Error).message,
      });
      if (!env.RESEND_API_KEY?.trim()) {
        throw smtpError;
      }
    }
  }

  await axios.post(
    "https://api.resend.com/emails",
    {
      from: env.EMAIL_FROM,
      to: [params.to],
      subject: params.subject,
      text: params.text,
      html: params.html ?? `<pre>${escapeHtml(params.text)}</pre>`,
    },
    {
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 15_000,
    }
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
