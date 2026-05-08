import nodemailer from "nodemailer";
import { env } from "../config/env";
import { logger } from "../../utils/logger";
import { mailQueue } from "../config/queue";
// @ts-ignore
import * as SibApiV3Sdk from "sib-api-v3-sdk";

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
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });
  }
  return smtpTransporter;
}

export async function verifyMailConfiguration(): Promise<boolean> {
  if (env.MAIL_PROVIDER === "console") {
    logger.info("[mail:console] Ready");
    return true;
  }
  if (env.MAIL_PROVIDER === "smtp") {
    const transporter = getSmtpTransporter();
    try {
      await transporter.verify();
      logger.info("[mail:smtp] Connection verified successfully");
      return true;
    } catch (error) {
      logger.error("[mail:smtp] Verification failed. Check your SMTP credentials and port (try 2525 if 587 is blocked).", { 
        error: (error as Error).message 
      });
      return false;
    }
  }
  if (env.MAIL_PROVIDER === "brevo") {
    logger.info("[mail:brevo] API Key detected. Ready.");
    return true;
  }
  return false;
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
  try {
    await mailQueue.add("send-email", params);
    logger.info("[mail:queue] Email queued", { to: params.to, subject: params.subject });
  } catch (error) {
    logger.error("[mail:queue] Failed to queue email", { error: (error as Error).message });
    // Fallback to direct send if queue fails in dev, or just rethrow
    if (env.NODE_ENV === "development") {
      logger.warn("[mail:queue] Falling back to direct send in development");
      return sendTransactionalEmailDirectly(params);
    }
    throw error;
  }
}

/**
 * Internal function to send email immediately.
 * Called by the worker.
 */
export async function sendTransactionalEmailDirectly(params: {
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
      logger.error("[mail:smtp] failed", {
        error: (smtpError as Error).message,
      });
      throw smtpError;
    }
  }

  if (env.MAIL_PROVIDER === "brevo") {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = env.BREVO_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = params.subject;
    sendSmtpEmail.htmlContent = params.html ?? `<pre>${escapeHtml(params.text)}</pre>`;
    sendSmtpEmail.textContent = params.text;

    // Parse EMAIL_FROM (Ex: "AFI-LISTEN <noreply@domain.com>")
    const fromMatch = env.EMAIL_FROM.match(/(.*)<(.*)>/);
    const fromName = fromMatch ? fromMatch[1].trim() : "AFI-LISTEN";
    const fromEmail = fromMatch ? fromMatch[2].trim() : env.EMAIL_FROM;

    sendSmtpEmail.sender = { name: fromName, email: fromEmail };
    sendSmtpEmail.to = [{ email: params.to }];

    try {
      await apiInstance.sendTransacEmail(sendSmtpEmail);
      logger.info("[mail:brevo] Email sent via API", { to: params.to });
    } catch (error) {
      logger.error("[mail:brevo] API call failed", {
        error: (error as any).response?.body || (error as Error).message,
      });
      throw error;
    }
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
