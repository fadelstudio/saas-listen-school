/**
 * Sends transactional email. With MAIL_PROVIDER=console, logs body (dev / no API key).
 */
export declare function sendTransactionalEmail(params: {
    to: string;
    subject: string;
    text: string;
    html?: string;
}): Promise<void>;
//# sourceMappingURL=mail.service.d.ts.map