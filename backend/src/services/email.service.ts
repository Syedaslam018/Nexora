import { getEmailProvider } from "../config/email.js";
import { env } from "../config/env.js";

/**
 * Plain-but-clean HTML templates. Each later phase that needs a
 * transactional email (order confirmation, shipping notice, refund
 * confirmation — Section 18) adds a `sendXEmail` function here, following
 * the same shape, rather than inventing a new pattern.
 */
function wrapHtml(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="font-family: Inter, Arial, sans-serif; background:#F7F8FB; padding:32px; color:#0B1120;">
    <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;padding:32px;border:1px solid #E5E7EB;">
      <p style="font-family: 'Space Grotesk', Arial, sans-serif; font-weight:700; font-size:20px; letter-spacing:-0.02em; margin:0 0 24px;">NEXORA</p>
      <h1 style="font-size:18px; margin:0 0 16px;">${title}</h1>
      ${bodyHtml}
      <p style="margin-top:32px; font-size:12px; color:#64748B;">NEXORA · This is an automated message.</p>
    </div>
  </body>
</html>`;
}

export async function sendWelcomeEmail(to: string, firstName: string): Promise<void> {
  const html = wrapHtml(
    `Welcome, ${firstName}`,
    `<p style="font-size:14px;line-height:1.6;">Your NEXORA account is set up. Verify your email to unlock order tracking and faster checkout.</p>`,
  );
  await getEmailProvider().send({
    to,
    subject: "Welcome to NEXORA",
    html,
    text: `Welcome to NEXORA, ${firstName}.`,
  });
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const link = `${env.CLIENT_URL}/verify-email?token=${token}`;
  const html = wrapHtml(
    "Verify your email",
    `<p style="font-size:14px;line-height:1.6;">Confirm this is your email address to activate your NEXORA account.</p>
     <p><a href="${link}" style="display:inline-block;background:#3B6EF6;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;">Verify email</a></p>
     <p style="font-size:12px;color:#64748B;">Link expires in 24 hours. If you didn't create this account, ignore this email.</p>`,
  );
  await getEmailProvider().send({
    to,
    subject: "Verify your NEXORA email",
    html,
    text: `Verify your email: ${link}`,
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const link = `${env.CLIENT_URL}/reset-password?token=${token}`;
  const html = wrapHtml(
    "Reset your password",
    `<p style="font-size:14px;line-height:1.6;">We received a request to reset your NEXORA password.</p>
     <p><a href="${link}" style="display:inline-block;background:#3B6EF6;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;">Reset password</a></p>
     <p style="font-size:12px;color:#64748B;">Link expires in 1 hour. If you didn't request this, your password is still safe — just ignore this email.</p>`,
  );
  await getEmailProvider().send({
    to,
    subject: "Reset your NEXORA password",
    html,
    text: `Reset your password: ${link}`,
  });
}
