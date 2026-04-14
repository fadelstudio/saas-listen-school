"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTransactionalEmail = sendTransactionalEmail;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const logger_1 = require("../../utils/logger");
/**
 * Sends transactional email. With MAIL_PROVIDER=console, logs body (dev / no API key).
 */
async function sendTransactionalEmail(params) {
    if (env_1.env.MAIL_PROVIDER === "console" || !env_1.env.RESEND_API_KEY) {
        logger_1.logger.info("[mail:console]", {
            to: params.to,
            subject: params.subject,
            text: params.text.slice(0, 500),
        });
        return;
    }
    await axios_1.default.post("https://api.resend.com/emails", {
        from: env_1.env.EMAIL_FROM,
        to: [params.to],
        subject: params.subject,
        text: params.text,
        html: params.html ?? `<pre>${escapeHtml(params.text)}</pre>`,
    }, {
        headers: {
            Authorization: `Bearer ${env_1.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
        },
        timeout: 15000,
    });
}
function escapeHtml(s) {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
//# sourceMappingURL=mail.service.js.map