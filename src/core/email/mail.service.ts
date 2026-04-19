import axios from "axios";
import { env } from "../config/env";
import { logger } from "../../utils/logger";

/**
 * Sends transactional email.
 * - `MAIL_PROVIDER=console`: log only (dev).
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
