/**
 * Sends transactional email.
 * - `MAIL_PROVIDER=console`: log only (dev).
 * - `MAIL_PROVIDER=smtp`: use SMTP (for Mailtrap/Ethereal).
 * - `MAIL_PROVIDER=resend`: HTTPS API Resend (`RESEND_API_KEY`, `EMAIL_FROM` vérifié côté Resend).
 */
export declare function sendTransactionalEmail(params: {
    to: string;
    subject: string;
    text: string;
    html?: string;
}): Promise<void>;
//# sourceMappingURL=mail.service.d.ts.map