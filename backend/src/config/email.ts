import nodemailer from "nodemailer";
import { env } from "./env.js";
import { logger } from "./logger.js";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}

/**
 * Logs the email instead of sending it. This is what `EMAIL_PROVIDER=mock`
 * (the .env.example default) uses, so the app is fully runnable in dev
 * without any real email credentials — every "email" just shows up in the
 * server logs, including the verification/reset link, which is exactly what
 * you need to click through the flow locally.
 */
class MockEmailProvider implements EmailProvider {
  async send(message: EmailMessage): Promise<void> {
    logger.info(
      { to: message.to, subject: message.subject, preview: message.text.slice(0, 500) },
      "📧 Mock email (EMAIL_PROVIDER=mock — not actually sent)",
    );
  }
}

/**
 * Real transport via SMTP (works with Mailgun/SES/SendGrid/Postmark's SMTP
 * endpoints, or a local Mailhog/Mailpit for dev if you'd rather see rendered
 * HTML than log lines). Swapping to a provider-specific HTTP API later means
 * adding a new class here and one line in `getEmailProvider` — nothing that
 * calls `emailProvider.send(...)` needs to change.
 */
class SmtpEmailProvider implements EmailProvider {
  private transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });

  async send(message: EmailMessage): Promise<void> {
    await this.transporter.sendMail({ from: env.EMAIL_FROM, ...message });
  }
}

let cachedProvider: EmailProvider | undefined;

export function getEmailProvider(): EmailProvider {
  if (!cachedProvider) {
    cachedProvider = env.EMAIL_PROVIDER === "smtp" ? new SmtpEmailProvider() : new MockEmailProvider();
  }
  return cachedProvider;
}
