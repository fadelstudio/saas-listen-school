"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTransactionalEmail = sendTransactionalEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const logger_1 = require("../../utils/logger");
let smtpTransporter = null;
function getSmtpTransporter() {
    if (!smtpTransporter) {
        smtpTransporter = nodemailer_1.default.createTransport({
            host: env_1.env.SMTP_HOST,
            port: env_1.env.SMTP_PORT,
            secure: env_1.env.SMTP_SECURE,
            auth: env_1.env.SMTP_USER && env_1.env.SMTP_PASS
                ? {
                    user: env_1.env.SMTP_USER,
                    pass: env_1.env.SMTP_PASS,
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
async function sendTransactionalEmail(params) {
    if (env_1.env.MAIL_PROVIDER === "console") {
        logger_1.logger.info("[mail:console]", {
            to: params.to,
            subject: params.subject,
            text: params.text.slice(0, 500),
        });
        return;
    }
    if (env_1.env.MAIL_PROVIDER === "smtp") {
        const transporter = getSmtpTransporter();
        try {
            const info = await transporter.sendMail({
                from: env_1.env.EMAIL_FROM,
                to: params.to,
                subject: params.subject,
                text: params.text,
                html: params.html ?? `<pre>${escapeHtml(params.text)}</pre>`,
            });
            // Ethereal helper URL to preview outbound emails in browser.
            const previewUrl = nodemailer_1.default.getTestMessageUrl(info);
            if (previewUrl) {
                logger_1.logger.info("[mail:smtp:preview]", { to: params.to, previewUrl });
            }
            return;
        }
        catch (smtpError) {
            logger_1.logger.error("[mail:smtp] failed", {
                error: smtpError.message,
            });
            throw smtpError;
        }
    }
}
function escapeHtml(s) {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
//# sourceMappingURL=mail.service.js.map