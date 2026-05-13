"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyMailConfiguration = verifyMailConfiguration;
exports.sendTransactionalEmail = sendTransactionalEmail;
exports.sendTransactionalEmailDirectly = sendTransactionalEmailDirectly;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const logger_1 = require("../../utils/logger");
const queue_1 = require("../config/queue");
// @ts-ignore
const SibApiV3Sdk = __importStar(require("sib-api-v3-sdk"));
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
            connectionTimeout: 5000,
            greetingTimeout: 5000,
            socketTimeout: 10000,
        });
    }
    return smtpTransporter;
}
async function verifyMailConfiguration() {
    if (env_1.env.MAIL_PROVIDER === "console") {
        logger_1.logger.info("[mail:console] Ready");
        return true;
    }
    if (env_1.env.MAIL_PROVIDER === "smtp") {
        const transporter = getSmtpTransporter();
        try {
            await transporter.verify();
            logger_1.logger.info("[mail:smtp] Connection verified successfully");
            return true;
        }
        catch (error) {
            logger_1.logger.error("[mail:smtp] Verification failed. Check your SMTP credentials and port (try 2525 if 587 is blocked).", {
                error: error.message
            });
            return false;
        }
    }
    if (env_1.env.MAIL_PROVIDER === "brevo") {
        logger_1.logger.info("[mail:brevo] API Key detected. Ready.");
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
async function sendTransactionalEmail(params) {
    try {
        await queue_1.mailQueue.add("send-email", params);
        logger_1.logger.info("[mail:queue] Email queued", { to: params.to, subject: params.subject });
    }
    catch (error) {
        logger_1.logger.error("[mail:queue] Failed to queue email", { error: error.message });
        // Fallback to direct send if queue fails
        logger_1.logger.warn("[mail:queue] Falling back to direct send because queue failed");
        return sendTransactionalEmailDirectly(params);
    }
}
/**
 * Internal function to send email immediately.
 * Called by the worker.
 */
async function sendTransactionalEmailDirectly(params) {
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
    if (env_1.env.MAIL_PROVIDER === "brevo") {
        const defaultClient = SibApiV3Sdk.ApiClient.instance;
        const apiKey = defaultClient.authentications["api-key"];
        apiKey.apiKey = env_1.env.BREVO_API_KEY;
        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.subject = params.subject;
        sendSmtpEmail.htmlContent = params.html ?? `<pre>${escapeHtml(params.text)}</pre>`;
        sendSmtpEmail.textContent = params.text;
        // Parse EMAIL_FROM (Ex: "AFI-LISTEN <noreply@domain.com>")
        const fromMatch = env_1.env.EMAIL_FROM.match(/(.*)<(.*)>/);
        const fromName = fromMatch ? fromMatch[1].trim() : "AFI-LISTEN";
        const fromEmail = fromMatch ? fromMatch[2].trim() : env_1.env.EMAIL_FROM;
        sendSmtpEmail.sender = { name: fromName, email: fromEmail };
        sendSmtpEmail.to = [{ email: params.to }];
        try {
            await apiInstance.sendTransacEmail(sendSmtpEmail);
            logger_1.logger.info("[mail:brevo] Email sent via API", { to: params.to });
        }
        catch (error) {
            logger_1.logger.error("[mail:brevo] API call failed", {
                error: error.response?.body || error.message,
            });
            throw error;
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